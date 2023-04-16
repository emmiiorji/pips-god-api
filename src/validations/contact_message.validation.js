const Joi = require('joi');

const createContactMessage = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().required().email(),
    message: Joi.string().required(),
  }),
};

const getContactMessages = {
  query: Joi.object().keys({
    fullName: Joi.string(),
    email: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getContactMessage = {
  params: Joi.object().keys({
    contactMessageId: Joi.number().integer().required(),
  }),
};

const updateContactMessage = {
  params: Joi.object().keys({
    contactMessageId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string(),
    })
    .min(1),
};

const deleteContactMessage = {
  params: Joi.object().keys({
    contactMessageId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
};
