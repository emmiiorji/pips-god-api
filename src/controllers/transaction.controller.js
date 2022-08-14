const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { transactionService } = require('../services');

const initializeTransaction = catchAsync(async (req, res) => {
  const result = await transactionService.initializeTransaction(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const verifyTransaction = catchAsync(async (req, res) => {
  const result = await transactionService.verifyTransaction(req.params.reference);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  initializeTransaction,
  verifyTransaction,
};
