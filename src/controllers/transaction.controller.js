const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { transactionService } = require('../services');

const initializeTransaction = catchAsync(async (req, res) => {
  const result = await transactionService.initializeTransaction(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const verifyTransaction = catchAsync(async (req, res) => {
  const result = await transactionService.verifyTransaction(req.params.accessCode);
  res.status(httpStatus.OK).send(result);
});

const getTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'validityUnit', 'email', 'authorizationUrl', 'reference', 'accessCode']);
  const options = pick(req.query, ['sortBy', 'direction', 'limit', 'page']);

  const transactions = await transactionService.queryTransactions(filter, options);
  res.send(transactions);
});

const getTransactionByReference = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionByReference(req.params.reference);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  res.send(transaction);
});

module.exports = {
  initializeTransaction,
  verifyTransaction,
  getTransactions,
  getTransactionByReference,
};
