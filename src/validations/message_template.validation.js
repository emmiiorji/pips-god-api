const Joi = require('joi');

const createMessageTemplate = {
  body: Joi.object().keys({
    messageTemplate: Joi.object()
      .keys({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        emailSubject: Joi.string().trim(),
        emailBody: Joi.string().trim(),
        smsSubject: Joi.string().trim(),
        smsBody: Joi.string().trim(),
      })
      .required(),
    variables: Joi.array().items({
      name: Joi.string().required(),
    }),
  }),
};

const getMessageTemplates = {
  query: Joi.object().keys({
    title: Joi.string(),
  }),
};

const getMessageTemplateById = {
  params: Joi.object().keys({
    messageTemplateId: Joi.string().required(),
  }),
};

const updateMessageTemplateById = {
  params: Joi.object().keys({
    messageTemplateId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    messageTemplate: Joi.object().keys({
      title: Joi.string().trim(),
      description: Joi.string().trim(),
      emailSubject: Joi.string().trim(),
      emailBody: Joi.string().trim(),
      smsSubject: Joi.string().trim(),
      smsBody: Joi.string().trim(),
    }),
    variables: Joi.array().items({
      name: Joi.string(),
    }),
  }),
};

const deleteMessageTemplateById = {
  params: Joi.object().keys({
    messageTemplateId: Joi.string().required(),
  }),
};

module.exports = {
  createMessageTemplate,
  getMessageTemplates,
  getMessageTemplateById,
  updateMessageTemplateById,
  deleteMessageTemplateById,
};
