const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const transactionId = req.body.transactionAccessCode;

  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user, verifyEmailToken, transactionId);

  res.status(httpStatus.CREATED).send({ message: 'Check your email for link to Verify your account', code: 201 });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user.dataValues.id);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  // const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  const { user, resetPasswordOTP } = await tokenService.generateResetPasswordOTP(req.body.email);
  await emailService.sendResetPasswordEmail(user, resetPasswordOTP);
  res.status(httpStatus.OK).send({ message: 'Check your email for otp to reset password', code: 200 });
});

const resetPassword = catchAsync(async (req, res) => {
  const message = await authService.resetPassword(req.query.token, req.body);
  res.status(httpStatus.OK).send({ message, code: 200 });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token, req.query.trans);
  res.status(httpStatus.OK).send({ message: 'Email has been verified', code: 200 });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
