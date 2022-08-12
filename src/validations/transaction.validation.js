const Joi = require('joi');
const { dateUnits } = require('../config/dateUnits');
const { transactionStatuses } = require('../config/transactionStatus');

const initializeTransaction = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    subscriptionPlanName: Joi.string().required(),
    // currency: Joi.string(),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    status: Joi.string().valid(...Object.values(transactionStatuses)),
    validityUnit: Joi.string().valid(...Object.values(dateUnits)),
    email: Joi.string().email(),
    authorizationUrl: Joi.string(),
    reference: Joi.string(),
    accessCode: Joi.string(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const verifyTransaction = {
  param: Joi.object().keys({
    reference: Joi.string().required(),
  }),
};

const getTransactionByReference = {
  param: Joi.object().keys({
    reference: Joi.string().required(),
  }),
};

module.exports = {
  initializeTransaction,
  getTransactions,
  verifyTransaction,
  getTransactionByReference,
};
