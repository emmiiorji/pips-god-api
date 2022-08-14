const httpStatus = require('http-status');
const paystack = require('paystack')(require('../config/config').paystack.secretKey);
const { client } = require('../config/config');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

/**
 * Initialize a transaction
 * @param {Object} transactionBody
 * @returns {Promise<Object>}
 */
const initializeTransaction = async (transactionBody) => {
  const subscriptionPlan = await db.subscription_plans.findOne({
    where: { name: transactionBody.subscriptionPlanName },
  });
  if (!subscriptionPlan) throw new ApiError(httpStatus.NOT_FOUND, 'Subscription plan not found');
  const result = await paystack.transaction.initialize(
    {
      email: transactionBody.email,
      amount: subscriptionPlan.price, // in kobo (100 kobo = 1 naira)
      currency: transactionBody.currency || 'NGN',
    },
    async function (error, body) {
      if (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
      } else {
        const { data } = body;
        await db.transactions.create({
          status: body.status ? 'initiated' : 'failed',
          email: transactionBody.email,
          authorizationUrl: data.authorization_url,
          reference: data.reference,
          accessCode: data.access_code,
          amount: subscriptionPlan.price,
        });
        return { authorizationUrl: body.data.authorization_url, reference: body.data.reference };
      }
    }
  );
  return result;
};

/**
 * Verify a transaction
 * @param {Object} transactionBody
 * @returns {Promise<Object>}
 */
const verifyTransaction = async (reference) => {
  const transaction = await db.transactions.findOne({ where: { reference } });
  if (!transaction) throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  try {
    const response = await paystack.transaction.verify(reference);
    if (transaction.status !== response.data.status) {
      transaction.update({ status: response.data.status });
    }

    // Record the transaction as a subscription

    const registrationUrl = `${client.baseUrl}/register/${reference}`;

    // Todo
    // Send email to the transaction email with registration link

    return {
      status: response.data.status,
      registrationUrl,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
    // console.error(error);
  }
};

/**
 * Query for transactions. Can be performed only by admin
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTransactions = async (filter, options) => {
  if (options.sortBy !== undefined) {
    // eslint-disable-next-line no-param-reassign
    options.order = [[options.sortBy, options.direction]];
  }

  // Todo
  // Change options.sortBy of format: sortField:(desc|asc) to options.order of format: [['sortField', 'DESC'|'ASC']]
  const transactions = await db.transactions.paginate({ where: filter, ...options });
  return transactions;
};

/**
 * Get transaction by reference
 * @param {string} reference
 * @returns {Promise<Transaction>}
 */
const getTransactionByReference = async (reference) => {
  const transaction = db.transactions.findOne({ where: { reference } });

  if (!transaction) throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  return transaction;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  queryTransactions,
  getTransactionByReference,
};
