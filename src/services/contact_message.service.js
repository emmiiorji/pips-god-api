const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createContactMessage = async (contactMessageBody) => {
  const contactMessage = await db.contact_messages.create(contactMessageBody);
  return contactMessage;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryContactMessages = async (filter, options) => {
  if (options.sortBy !== undefined) {
    const [sortBy, direction] = options.sortBy.split(':');
    if (!Object.keys(db.contact_messages.rawAttributes).includes(sortBy)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid column name for contact message`);
    }
    if (!['asc', 'desc'].includes(direction.toLowerCase())) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid order`);
    }

    // eslint-disable-next-line no-param-reassign
    options.order = [[options.sortBy, options.direction]];
  }
  const contactMessages = await db.contact_messages.paginate({
    where: filter,
    ...options,
  });
  return contactMessages;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getContactMessageById = async (id) => {
  const contactMessages = await db.contact_messages.findByPk(id);
  return contactMessages;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateContactMessageById = async (contactMessageId, updateBody) => {
  const contactMessage = await getContactMessageById(contactMessageId);
  if (!contactMessage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact Message not found');
  }
  Object.assign(contactMessage, updateBody);
  await db.contact_messages.update(contactMessage, { where: { id: contactMessageId } });
  return contactMessage;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteContactMessageById = async (userId) => {
  const contactMessage = await getContactMessageById(userId);
  if (!contactMessage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await db.contact_messages.destroy(contactMessage);
  return contactMessage;
};

module.exports = {
  createContactMessage,
  queryContactMessages,
  getContactMessageById,
  updateContactMessageById,
  deleteContactMessageById,
};
