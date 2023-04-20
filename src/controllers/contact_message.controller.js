const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { contactMessageService } = require('../services');

const createContactMessage = catchAsync(async (req, res) => {
  const contactMessage = await contactMessageService.createContactMessage(req.body);
  res.status(httpStatus.CREATED).send(contactMessage);
});

const getContactMessages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await contactMessageService.queryContactMessages(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getContactMessage = catchAsync(async (req, res) => {
  const contactMessage = await contactMessageService.getContactMessageById(req.params.contactMessageId);
  if (!contactMessage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact Message not found');
  }
  res.status(httpStatus.OK).send(contactMessage);
});

const updateContactMessage = catchAsync(async (req, res) => {
  const contactMessage = await contactMessageService.updateContactMessageById(req.params.contactMessageId, req.body);
  res.send(contactMessage);
});

const deleteContactMessage = catchAsync(async (req, res) => {
  await contactMessageService.deleteContactMessageById(req.params.contactMessageId);
  res.status(httpStatus.OK).status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
};
