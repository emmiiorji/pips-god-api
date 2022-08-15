const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const transactionValidation = require('../../validations/transaction.validation');
const transactionController = require('../../controllers/transaction.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(transactionValidation.initializeTransaction), transactionController.initializeTransaction)
  .get(validate(transactionValidation.getTransactions), transactionController.getTransactions);

router
  .route('/verify/:reference')
  .get(validate(transactionValidation.verifyTransaction), transactionController.verifyTransaction);

router
  .route('/:reference')
  .get(
    auth('manageTransactions'),
    validate(transactionValidation.getTransactionByReference),
    transactionController.getTransactionByReference
  );

module.exports = router;
