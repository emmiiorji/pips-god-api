const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (user, token) => {
  const subject = 'Reset password: OTP';

  const text = `Dear ${user.firstName},
You requested to reset your password. Kindly enter the One Time Password below (valid for 5mins):

${token}

If you did not request any password reset, we assure that your account is secure. Please ignore this email and do not share with a third party.`;
  await sendEmail(user.email, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (user, token, transactionId) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${config.client.baseUrl}/verify-email?token=${token}${transactionId ? '&trans=' : ''}${
    transactionId || ''
  }`;
  const text = `Dear ${user.firstName || 'user'},

Welcome to Pipsgod Academy. To verify your email, click on this link: ${verificationEmailUrl}

If you did not create an account, kindly ignore this email.

Regards,
The Pipsgod Team.`;
  await sendEmail(user.email, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
