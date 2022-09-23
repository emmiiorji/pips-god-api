const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { messageTemplateService } = require('../services');
const pick = require('../utils/pick');

const createMessageTemplate = catchAsync(async (req, res) => {
  const messageTemplate = await messageTemplateService.createMessageTemplate(req.body);
  res.status(httpStatus.CREATED).send(messageTemplate);
});

const getMessageTemplates = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title']);
  const messageTemplates = await messageTemplateService.getAllMessageTemplates(filter);
  res.status(httpStatus.OK).send(messageTemplates);
});

const getMessageTemplateById = catchAsync(async (req, res) => {
  const messageTemplate = await messageTemplateService.getMessageTemplateById(req.params.messageTemplateId);
  if (!messageTemplate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message Template not found');
  }
  res.status(httpStatus.OK).send(messageTemplate);
});

const updateMessageTemplateById = catchAsync(async (req, res) => {
  const messageTemplate = await messageTemplateService.updateMessageTemplateById(req.params.messageTemplateId, req.body);
  res.status(httpStatus.OK).send(messageTemplate);
});

const deleteMessageTemplateById = catchAsync(async (req, res) => {
  await messageTemplateService.deleteMessageTemplateById(req.params.messageTemplateId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMessageTemplate,
  getMessageTemplates,
  getMessageTemplateById,
  updateMessageTemplateById,
  deleteMessageTemplateById,
};
