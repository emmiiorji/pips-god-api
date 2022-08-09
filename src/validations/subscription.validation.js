const Joi = require('joi');
const { dateUnits } = require('../config/dateUnits');

const createSubscription = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    subscriptionPlanId: Joi.number().integer().required(),
    transactionId: Joi.number().integer(),
    validity: Joi.number().integer(),
    validityUnit: Joi.string().valid(...Object.values(dateUnits)),
  }),
};

module.exports = {
  createSubscription,
};
