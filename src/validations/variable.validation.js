const Joi = require('joi');

const createVariable = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const getVariables = {
  query: Joi.object().keys({
    name: Joi.string(),
  }),
};

const getVariable = {
  params: Joi.object().keys({
    variableId: Joi.string().required(),
  }),
};

const updateVariableById = {
  params: Joi.object().keys({
    variableId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
  }),
};

const deleteVariableById = {
  params: Joi.object().keys({
    variableId: Joi.string().required(),
  }),
};

module.exports = {
  createVariable,
  getVariable,
  updateVariableById,
  deleteVariableById,
  getVariables,
};
