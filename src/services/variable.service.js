const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

/**
 * Get all variables
 * @param {Object} filter - Sequelize filter
 * @returns {Promise<Variable[]>}
 */
const getAllVariables = async (filter) => {
  return db.variable.findAll({ where: filter });
};

/**
 * Get variable by id
 * @param {ObjectId} id
 * @returns {Promise<Variable>}
 */
const getVariableById = async (id) => {
  return db.variable.findByPk(id);
};

/**
 * Create variable
 * @param {Object} variableBody
 * @returns {Promise<Variable>}
 */
const createVariable = async (variableBody) => {
  // check if variable name is taken
  const variable = await db.variable.findOne({ where: { name: variableBody.name } });
  if (variable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Variable name already taken');
  }
  return db.variable.create(variableBody);
};

/**
 * Update variable by id
 * @param {ObjectId} variableId
 * @param {Object} updateBody
 * @returns {Promise<Variable>}
 */
const updateVariableById = async (variableId, updateBody) => {
  const variable = await getVariableById(variableId);
  if (!variable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }
  Object.assign(variable, updateBody);
  await variable.save();
  return variable;
};

/**
 * Delete variable by id
 * @param {ObjectId} variableId
 * @returns {Promise<Variable>}
 */
const deleteVariableById = async (variableId) => {
  const variable = await getVariableById(variableId);
  if (!variable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }
  await variable.destroy();
  return variable;
};

module.exports = {
  getAllVariables,
  getVariableById,
  createVariable,
  updateVariableById,
  deleteVariableById,
};
