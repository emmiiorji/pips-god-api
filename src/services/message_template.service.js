const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

/**
 * Get all message templates
 * @param {Object} filter - Sequelize filter
 * @returns {Promise<MessageTemplate[]>}
 */
const getAllMessageTemplates = async (filter) => {
  return db.message_template.findAll({
    where: filter,
    include: {
      model: db.variable,
      as: 'variables',
      attributes: ['id', 'name'], // only return id and name
      through: { attributes: [] }, // don't return join table attributes
    },
  });
};

/**
 * Get message template by id
 * @param {ObjectId} id
 * @returns {Promise<MessageTemplate>}
 */
const getMessageTemplateById = async (id) => {
  return db.message_template.findByPk(id, {
    include: {
      model: db.variable,
      as: 'variables',
      attributes: ['id', 'name'], // only return id and name
      through: { attributes: [] }, // don't return join table attributes
    },
  });
};

/**
 * Get message template by title
 * @param {String} title
 * @returns {Promise<MessageTemplate>}
 */
const getMessageTemplateByTitle = async (title) => {
  return db.message_template.findOne({ where: { title } });
};

/**
 * Convert template to message
 * @param {Object} template
 * @param {Object} values
 * @returns {Promise<String>}
 */
const convertTemplateToMessage = async (template, values) => {
  return template.replace(/{{(\w+)}}/g, (match, key) => values[key] || match);
};

/**
 * Resolve template variables by adding or removing
 * @param {Object} messageTemplate
 * @param {Array} variables
 * @returns
 */
const resolveMessageTemplateVariables = async (messageTemplate, variables) => {
  if (!variables) return { newVariables: [], variablesToRemove: [] };

  // check if variables exist
  const variablesObject = await db.variable.findAll({
    where: { name: variables.map((variable) => variable.name) },
  });

  // check if all variables exist
  if (variablesObject.length !== variables.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Some variables do not exist');
  }

  // get existing variables
  const existingVariables = await messageTemplate.getVariables();

  // get variable names
  const existingVariableNames = existingVariables.map((variable) => variable.dataValues.name);

  // filter existing variables to get variables to remove
  const variablesToRemove = existingVariables.filter(
    (variable) => !variables.map((v) => v.name).includes(variable.dataValues.name)
  );

  // filter existing variable to get variables to add
  const newVariables = variables.filter((variable) => !existingVariableNames.includes(variable.name));

  // get new variables instance from database by filtering the variable object
  const newVariablesToAdd = variablesObject.filter((variable) =>
    newVariables.map((v) => v.name).includes(variable.dataValues.name)
  );
  // add new variables
  await messageTemplate.setVariables(newVariablesToAdd);

  // remove variables
  await messageTemplate.removeVariables(variablesToRemove);
};

/**
 * Create message template
 * @param {Object} messageTemplateBody
 * @returns {Promise<MessageTemplate>}
 */
const createMessageTemplate = async (messageTemplateBody) => {
  const { messageTemplate, variables } = messageTemplateBody;
  // check if message template title is taken
  const messageTemplateExist = await db.message_template.findOne({ where: { title: messageTemplate.title } });
  if (messageTemplateExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Message template title already taken');
  }

  // use transaction to create message template and variables
  const transaction = await db.sequelize.transaction();
  const createdTemplate = await db.message_template.create(messageTemplate, { transaction });

  if (variables) {
    // find variables by name
    const foundVariables = await db.variable.findAll({ where: { name: variables.map((variable) => variable.name) } });

    // check if all variables exist
    if (foundVariables.length !== variables.length) {
      await transaction.rollback();
      throw new ApiError(httpStatus.BAD_REQUEST, 'Some variables do not exist');
    }
    // set the variables to the message template
    await createdTemplate.setVariables(foundVariables || [], { transaction });
  }
  // commit transaction
  await transaction.commit();
  return createdTemplate;
};

/**
 * Update message template by id
 * @param {ObjectId} messageTemplateId
 * @param {Object} updateBody
 * @returns {Promise<MessageTemplate>}
 */
const updateMessageTemplateById = async (messageTemplateId, updateBody) => {
  const { messageTemplate, variables } = updateBody;

  const messageTemplateExist = await getMessageTemplateById(messageTemplateId);

  // check if message template title is taken
  if (!messageTemplateExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message template not found');
  }

  // check if message template title is taken
  if (messageTemplate && messageTemplate.title && messageTemplate.title !== messageTemplateExist.title) {
    const messageTemplateExistByTitle = await db.message_template.findOne({ where: { title: messageTemplate.title } });
    if (messageTemplateExistByTitle) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Message template title already taken');
    }
  }

  // resolve variables
  await resolveMessageTemplateVariables(messageTemplateExist, variables);

  // update message template
  Object.assign(messageTemplateExist, messageTemplate);

  await messageTemplateExist.save();

  // return updated message template
  return messageTemplateExist;
};

/**
 * Delete message template by id
 * @param {ObjectId} messageTemplateId
 * @returns {Promise<MessageTemplate>}
 */
const deleteMessageTemplateById = async (messageTemplateId) => {
  const messageTemplate = await getMessageTemplateById(messageTemplateId);
  if (!messageTemplate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message template not found');
  }
  await messageTemplate.destroy();
  return messageTemplate;
};

module.exports = {
  getAllMessageTemplates,
  getMessageTemplateById,
  createMessageTemplate,
  updateMessageTemplateById,
  deleteMessageTemplateById,
  convertTemplateToMessage,
  getMessageTemplateByTitle,
};
