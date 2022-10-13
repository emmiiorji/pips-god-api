const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    DB_URL: Joi.string().required().description('DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    OTP_EXPIRATION_MINUTES: Joi.number().default(5).description('minutes after which OTP expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_SERVICE: Joi.string().description('name of service associated with smtp server'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    PAYSTACK_SECRET_KEY: Joi.string().required().description('the paystack secret key'),
    PAYSTACK_PUBLIC_KEY: Joi.string().description('the paystack public key'),
    CLIENT_BASE_URL: Joi.string().required().description('the client base url'),
    CLIENT_BASE_URL_HOSTED: Joi.string().description('the url of hosted client'),
    BCRYPT_SALT: Joi.string().description('salt for bcrypt hashing'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  sequelize: {
    url: envVars.DB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    host: envVars.DB_HOST,
    database: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    dialect: envVars.DIALECT,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    otpExpirationMinutes: envVars.OTP_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      service: envVars.SMTP_SERVICE,
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  paystack: {
    secretKey: envVars.PAYSTACK_SECRET_KEY,
    publicKey: envVars.PAYSTACK_PUBLIC_KEY,
  },
  client: {
    baseUrl: envVars.CLIENT_BASE_URL,
    baseUrlHosted: envVars.CLIENT_BASE_URL_HOSTED || envVars.CLIENT_BASE_URL,
  },
  bCrypt: {
    salt: envVars.BCRYPT_SALT,
  },
};
