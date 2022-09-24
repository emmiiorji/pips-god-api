const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { variableService } = require('../services');
const pick = require('../utils/pick');

const createVariable = catchAsync(async (req, res) => {
  const variable = await variableService.createVariable(req.body);
  res.status(httpStatus.CREATED).send(variable);
});

const getVariables = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const variables = await variableService.getAllVariables(filter);
  res.status(httpStatus.OK).send(variables);
});

const getVariableById = catchAsync(async (req, res) => {
  const variable = await variableService.getVariableById(req.params.variableId);
  if (!variable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Variable not found');
  }
  res.status(httpStatus.OK).send(variable);
});

const updateVariableById = catchAsync(async (req, res) => {
  const variable = await variableService.updateVariableById(req.params.variableId, req.body);
  res.status(httpStatus.OK).send(variable);
});

const deleteVariableById = catchAsync(async (req, res) => {
  await variableService.deleteVariableById(req.params.variableId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createVariable,
  getVariables,
  getVariableById,
  updateVariableById,
  deleteVariableById,
};
