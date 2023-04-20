const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const speakeasy = require('speakeasy');
const config = require('../config/config');
const { db } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/constants');
// const { getUserByEmail } = require('./user.service');

const getUserByEmail = async (email) => {
  return db.users.findOne({
    where: { email },
    attributes: { exclude: ['password'] },
    include: {
      model: db.roles,
      as: 'roles',
      attributes: ['name'],
      through: { attributes: [] },
    },
  });
};

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, userRole, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    userRole,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await db.tokens.create({
    token,
    userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await db.tokens.findOne({ where: { token, type, userId: payload.sub, blacklisted: false } });

  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const verifyOTP = async (token, email) => {
  const user = await db.users.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const verified = speakeasy.totp.verify({
    secret: parseInt(user.otpSecret, 10),
    encoding: 'base32',
    token,
    step: config.jwt.otpExpirationMinutes * 60,
  });

  return { verified, user };
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, userRole) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS, userRole);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user, refreshTokenExpires, tokenTypes.REFRESH, userRole);
  await saveToken(refreshToken, user, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

const generateOTP = (secret) => {
  const totp = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
    step: config.jwt.otpExpirationMinutes * 60,
  });
  return totp;
};

const generateResetPasswordOTP = async (email) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }

  // const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordOTP = generateOTP(user.otpSecret);
  // await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return { user, resetPasswordOTP };
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  verifyOTP,
  generateAuthTokens,
  generateResetPasswordToken,
  generateResetPasswordOTP,
  generateVerifyEmailToken,
};
