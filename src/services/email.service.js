const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
const config = require('../config/config');
const logger = require('../config/logger');
const {
  sendOtpEmailTemplate,
  sendVerificationEmailTemplate,
  sendRegistrationEmailTemplate,
} = require('../public/javascripts/mails');
const confirmEmailVerificationTemplate = require('../public/javascripts/mails/confirmEmailVerificationTemplate');

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
const sendEmail = async (to, subject, html, text) => {
  // eslint-disable-next-line no-param-reassign
  text = text || convert(html);
  const msg = { from: config.email.from, to, subject, html, text };
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

  const html = sendOtpEmailTemplate(user.firstName, token);
  await sendEmail(user.email, subject, html);
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
  const verificationEmailUrl = `${config.client.baseUrlHosted}/verify-email?token=${token}${transactionId ? '&trans=' : ''}${
    transactionId || ''
  }`;
  const html = sendVerificationEmailTemplate(user.firstName, verificationEmailUrl);
  await sendEmail(user.email, subject, html);
};

const confirmEmailVerification = async (user) => {
  const subject = 'Welcome to Pipsgod Academy';
  const dashboardUrl = `${config.client.baseUrlHosted}/portal`;

  const html = confirmEmailVerificationTemplate(user.firstName, dashboardUrl);
  await sendEmail(user.email, subject, html);
};

const resendVerificationEmail = async (user, token, transactionId) => {
  const subject = 'Re: Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${config.client.baseUrlHosted}/verify-email?token=${token}${transactionId ? '&trans=' : ''}${
    transactionId || ''
  }`;
  const text = `Dear ${user.firstName || 'user'},

Welcome to Pipsgod Academy. You seem to have tried to verify your email using an expired link. Here's a new link to verify your email: ${verificationEmailUrl}

If you did not create an account with us, kindly ignore this email.

Regards,
The Pipsgod Academy Team.`;
  await sendEmail(user.email, subject, text);
};

const sendRegistrationEmail = async (transaction, registrationUrl, planTitle) => {
  const subject = 'Subscription Successful';

  const html = sendRegistrationEmailTemplate(planTitle, registrationUrl);

  await sendEmail(transaction.email, subject, html);
};

const sendVipSignalsEmail = async (transaction, subscriptionPlan) => {
  const subject = 'Subscription Successful';

  const text = `Hi ,

Thank you for subscribing to the ${subscriptionPlan.title} plan on Pipsgod Academy. Here's the link to the telegram group for classes:

${subscriptionPlan.telegramGroupUrl}

Regards,
The Pipsgod Academy Team.`;
  await sendEmail(transaction.email, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendRegistrationEmail,
  sendVipSignalsEmail,
  resendVerificationEmail,
  confirmEmailVerification,
};
