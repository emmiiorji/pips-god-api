const httpStatus = require('http-status');
const { nanoid } = require('nanoid');
const paystack = require('paystack')(require('../config/config').paystack.secretKey);
const { client } = require('../config/config');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');
const { transactionStatuses } = require('../config/transactionStatus');
const { emailService } = require('.');

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

  const transactionId = nanoid();
  const result = await paystack.transaction.initialize(
    {
      email: transactionBody.email,
      amount: subscriptionPlan.price, // in kobo (100 kobo = 1 naira)
      currency: transactionBody.currency || 'NGN',
      callback_url: `${client.baseUrlHosted}/paystack/success/${transactionId}`,
    },
    async function (error, body) {
      if (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
      } else {
        const { data } = body;
        await db.transactions.create({
          id: transactionId,
          status: body.status ? 'initiated' : 'failed',
          email: transactionBody.email,
          authorizationUrl: data.authorization_url,
          reference: data.reference,
          accessCode: data.access_code,
          amount: subscriptionPlan.price,
          amountUnit: subscriptionPlan.priceUnit,
          subscriptionPlanId: subscriptionPlan.id,
        });
        return { authorizationUrl: body.data.authorization_url };
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
const verifyTransaction = async (transactionId) => {
  const transaction = await db.transactions.findOne({ where: { id: transactionId } });

  if (!transaction) throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  if (transaction.isUsed) throw new ApiError(httpStatus.CONFLICT, 'This transaction has been used before');

  const subscriptionPlan = await db.subscription_plans.findOne({ where: { id: transaction.subscriptionPlanId } });

  try {
    const response = await paystack.transaction.verify(transaction.reference);
    if (!(response.data.amount === transaction.amount) && response.data.status === 'success') {
      await transaction.update({ status: transactionStatuses.PARTIALLY_PAID });
    } else if (transaction.status !== response.data.status) {
      await db.transactions.update({ status: response.data.status }, { where: { id: transaction.id } });
    }
    if (response.data.status !== 'success') return { status: response.data.status };

    // Record the transaction as a subscription

    const registrationUrl = `${client.baseUrlHosted}/register/${transaction.id}`; // Change access code to transaction id

    // Todo
    // Only send registration link if it's a registration.

    if (!transaction.sentRegistrationEmail) {
      await emailService.sendRegistrationEmail(transaction, registrationUrl, subscriptionPlan.title);
      await db.transactions.update({ sentRegistrationEmail: true }, { where: { id: transaction.id } });
    }

    return { status: response.data.status };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
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
    const [sortBy, direction] = options.sortBy.split(':');
    if (Object.keys(db.transactions.rawAttributes).includes(sortBy)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid column name for transaction`);
    }
    if (['asc', 'desc'].includes(direction.toLowerCase())) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid order`);
    }

    // eslint-disable-next-line no-param-reassign
    options.order = [[sortBy, direction]];
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
