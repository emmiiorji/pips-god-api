const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

/**
 * Query for subscriptions. Only allowed for admin user
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySubscriptions = async (filter, options) => {
  // Todo
  // Change options.sortBy of format: sortField:(desc|asc) to options.order of format: [['sortField', 'DESC'|'ASC']]
  const subscriptions = await db.subscriptions.paginate({
    where: filter,
    ...options,
    include: {
      model: db.transactions,
      attributes: ['id', 'status', 'email', 'reference', 'amount', 'currency'], // only return listed attributes
    },
  });
  return subscriptions;
};

/**
 * Get Subscriptions made by userId
 * @param {ObjectId} id
 * @returns {Promise<Subscription>}
 */
const getUserSubscriptions = async (userId) => {
  return db.subscriptions.paginate({
    where: { userId },
    include: {
      model: db.transactions,
      attributes: ['id', 'status', 'email', 'reference', 'amount', 'currency'], // only return listed attributes
    },
  });
};

/**
 * Get subscriptions by subscriptionPlan
 * @param {string} subscriptionPlan
 * @returns {Promise<Array[Subscription]>}
 */
const getSubscriptionsByPlan = async (name) => {
  return db.subscriptions.paginate({
    where: { name },
    include: {
      model: db.transactions,
      attributes: ['id', 'status', 'email', 'reference', 'amount', 'currency'], // only return listed attributes
    },
  });
};

/**
 * Get subscription by transactionId
 * @param {string} subscriptionPlan
 * @returns {Promise<Subscription>}
 */
const getSubscriptionByTransactionId = async (transactionId) => {
  const subscription = db.transactions.findOne({ where: { transactionId } });
  if (!subscription) throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  return subscription;
};

module.exports = {
  querySubscriptions,
  getUserSubscriptions,
  getSubscriptionsByPlan,
  getSubscriptionByTransactionId,
};
