const httpStatus = require('http-status');
const paystack = require('paystack')(require('../config/config').paystack.secretKey);
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

/**
 * Initialize a transaction
 * @param {Object} transactionBody
 * @returns {Promise<User>}
 */
const initializeTransaction = async (transactionBody) => {
  const subscriptionPlan = await db.subscriptionPlan.findOne({
    where: { name: transactionBody.subscriptionPlanName },
  });
  paystack.transaction.initialize(
    {
      email: transactionBody.email,
      amount: subscriptionPlan.price, // in kobo (100 kobo = 1 naira)
      currency: transactionBody.currency || 'NGN',
    },
    function (error, body) {
      if (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
      } else {
        const { data } = body;
        db.transactions.create({
          status: data.status,
          email: transactionBody.email,
          authorizationUrl: data,
          reference: data.reference,
          accessCode: data.access_code,
          amount: subscriptionPlan.price,
        });
        return { authorizationUrl: body.data.authorization_url };
      }
    }
  );
};

/**
 * Verify a transaction
 * @param {Object} transactionBody
 * @returns {Promise<User>}
 */
const verifyTransaction = async (reference) => {
  const transaction = await db.transactions.findOne({ where: { reference } });
  if (!transaction) throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  try {
    const response = await paystack.transaction.verify(reference);
    if (transaction.status !== response.data.status) {
      transaction.update({ status: response.data.status });
    }
    // Record the transaction a subscription
    return { status: response.data.status };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
    // console.error(error);
  }
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
};
