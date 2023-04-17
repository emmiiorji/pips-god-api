const httpStatus = require('http-status');
const { db } = require('../models');
const ApiError = require('../utils/ApiError');

const createNotification = async (notificationBody) => {
  return db.notifications.create(notificationBody);
};

/**
 * Query for notification
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryNotifications = async (filter, options) => {
  if (options.sortBy !== undefined) {
    // eslint-disable-next-line no-param-reassign
    options.order = [[options.sortBy, options.direction]];
  }

  const transactions = await db.transactions.paginate({ where: filter, ...options });
  return transactions;
};

/**
 * Get Notification by id
 * @param {string} id
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id) => {
  return db.notifications.findByPk(id);
};

/**
 * Update message by id
 * @param {String} notificationId
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotificationById = async (id, updateBody) => {
  const notification = await getNotificationById(id);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  Object.assign(notification, updateBody);
  notification.save();
  return notification;
};

/**
 * Delete Notification by id
 * @param {String} notificationId
 * @returns {Promise<Notification>}
 */
const deleteNotificationById = async (id) => {
  const notification = await getNotificationById(id);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  return db.notifications.destroy({ where: { id } });
};

module.exports = {
  createNotification,
  getNotificationById,
  queryNotifications,
  updateNotificationById,
  deleteNotificationById,
};
