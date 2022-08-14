const httpStatus = require('http-status');
const pick = require('../utils/pick');
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

const getTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'validityUnit', 'email', 'authorizationUrl', 'reference', 'accessCode']);
  const options = pick(req.query, ['sortBy', 'direction', 'limit', 'page']);

  const transactions = await transactionService.queryTransactions(filter, options);
  res.send(transactions);
});

module.exports = {
  initializeTransaction,
  verifyTransaction,
  getTransactions,
};
