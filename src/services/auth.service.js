const httpStatus = require('http-status');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const userService = require('./user.service');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const { db } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes, subscriptionNames } = require('../config/constants');
const { bCrypt } = require('../config/config');
const { enrollUserInCourse } = require('./course.service');
const logger = require('../config/logger');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await db.users.findOne({
    where: { email },
    include: ['roles'],
    attributes: { exclude: ['otpSecret'] },
  });
  if (!user || !(await userService.isPasswordMatch(password, user))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  user.roles = user.roles.map((role) => role.name);

  // Force user to verify email of they are not an admin or superadmin
  if (!user.roles.includes('user') && !user.isEmailVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Please verify your email');
  }
  delete user.dataValues.password;
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await db.findOne({ where: { token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false } });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, requestBody) => {
  // save is false when we're the only checking if the user's entered token is valid
  const save = requestBody.save || false;

  const { verified, user } = await tokenService.verifyOTP(resetPasswordToken, requestBody.email);
  if (!verified) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');

  if (!save) {
    return 'Token is valid';
  }
  if (!requestBody.password) throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
  await userService.updateUserById(user.id, {
    password: bcrypt.hashSync(requestBody.password, bCrypt.salt || 10),
    otpSecret: speakeasy.generateSecret().base32,
  });
  return 'Password updated successfully';
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken, transactionId) => {
  const transaction = await db.transactions.findOne({ where: { id: transactionId } });
  let user;
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    user = await userService.getUserById(verifyEmailTokenDoc.userId);
  } catch (error) {
    if (transaction) {
      if (transaction.isUsed) {
        throw new ApiError(httpStatus.ALREADY_REPORTED, 'Email already verified');
      }
    }
    if (transaction && !transaction.isUsed) {
      const subscription = await db.subscriptions.findOne({ where: { transactionId } });
      user = await db.users.findOne({ where: { id: subscription.userId } });

      if (!user.isEmailVerified) {
        const newVerifyEmailToken = await tokenService.generateVerifyEmailToken(user);
        await emailService.resendVerificationEmail(user, newVerifyEmailToken, transaction.id);
        throw new ApiError(
          httpStatus.PERMANENT_REDIRECT,
          'Your token seems to have expired. A new link has been sent to your mail'
        );
      }
      throw new ApiError(httpStatus.ALREADY_REPORTED, 'Transaction already used for subscription');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
  }

  if (user.isEmailVerified) {
    throw new ApiError(httpStatus.ALREADY_REPORTED, 'Email already verified');
  }

  await db.tokens.destroy({ where: { userId: user.id, type: tokenTypes.VERIFY_EMAIL } });
  await userService.updateUserById(user.id, { isEmailVerified: true });

  // TODO: Send email to user that their email has been verified

  const subscription = await db.subscriptions.findOne({ where: { transactionId } });
  if (!subscription) {
    throw new Error();
  }
  await db.transactions.update({ isUsed: true }, { where: { id: subscription.transactionId } });
  const trainingAndMentoring = await db.courses.findOne({ where: { name: subscriptionNames.TRAINING_AND_MENTORING } });
  const sequelizeTransaction = await db.sequelize.transaction();
  try {
    await enrollUserInCourse(trainingAndMentoring.id, subscription.userId, sequelizeTransaction);
    await sequelizeTransaction.commit();
  } catch (error) {
    await sequelizeTransaction.rollback();
    logger.error(error);
    throw error;
  }
  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
