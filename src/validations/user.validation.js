const Joi = require('joi');
const moment = require('moment');
const { password } = require('./custom.validation');

const isEmailTaken = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    role: Joi.string().trim().required(),
  }),
};

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string(),
    role: Joi.string().trim().required(),
    // transactionAccessCode: Joi.string().required(), // This has changed to transaction ID
  }),
};

const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    role: Joi.string(),
    subscriptionId: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      firstName: Joi.string(),
      lastName: Joi.string(),
      middleName: Joi.string(),
      phone: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const getAdminDashboardStats = {
  query: Joi.object().keys({
    startDate: Joi.string().default('2020-01-01'), // Arbitrary date
    endDate: Joi.string().default(moment().format('YYYY-MM-DD')),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  getAdminDashboardStats,
  updateUser,
  deleteUser,
  isEmailTaken,
};
