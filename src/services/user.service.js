const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');
const logger = require('../config/logger');
const { bCrypt } = require('../config/config');
const pick = require('../utils/pick');

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async function (email) {
  const user = await db.users.findOne({ where: { email } });
  logger.info(user);
  return !!user;
};

const removePassword = (user) => {
  if (typeof user === 'object' && user !== null && !Array.isArray(user)) {
    return pick(
      user.dataValues,
      Object.keys(user.dataValues).filter((key) => !['password', 'otpSecret'].includes(key))
    );
  }
  return user;
};

const filterUser = (user) => {
  const newUser = {
    ...user,
    dataValues: {
      ...user.dataValues,
      roles: user.roles.map((role) => pick(role.dataValues, ['name'])),
    },
  };
  return removePassword(newUser);
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
const isPasswordMatch = async function (password, user) {
  const comp = bcrypt.compareSync(password, user.password);
  logger.info(comp);
  return comp;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const { transactionAccessCode, role, ...user } = userBody;
  const transactionId = transactionAccessCode; // The data expected is transaction ID not access code
  const userRole = await db.roles.findOne({ where: { name: 'user' } });

  if (!userRole && role) throw new ApiError(httpStatus.BAD_REQUEST, 'Role does not exist');

  // TODO: If role is admin, check if user is admin or superadmin

  const transaction = await db.transactions.findOne({ where: { id: transactionId } });
  if (!transaction) throw new ApiError(httpStatus.PAYMENT_REQUIRED, 'Invalid transaction ID');

  if (transaction.status !== 'success') throw new ApiError(httpStatus.PAYMENT_REQUIRED, 'Please, complete your order');

  if (transaction.isUsed) throw new ApiError(httpStatus.ALREADY_REPORTED, 'This transaction has been used');

  if (await isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // eslint-disable-next-line no-param-reassign
  user.password = bcrypt.hashSync(user.password, bCrypt.salt || 10);

  let sequelizeTransaction;
  try {
    // Use a transaction to create the user and subscription
    sequelizeTransaction = await db.sequelize.transaction();
    const userCreated = await db.users.create(user, { transaction: sequelizeTransaction });
    const subscriptionPlan = await db.subscription_plans.findByPk(transaction.subscriptionPlanId);

    await userCreated.addRole(role || userRole.id, { transaction: sequelizeTransaction });
    await db.subscriptions.create(
      {
        userId: userCreated.id,
        transactionId: transaction.id,
        subscriptionPlanId: transaction.subscriptionPlanId,
        validity: subscriptionPlan.validity,
      },
      { transaction: sequelizeTransaction }
    );

    // await db.transactions.update({ isUsed: true }, { where: { id: transaction.id }, transaction: sequelizeTransaction });

    await sequelizeTransaction.commit();
    delete userCreated.dataValues.password;
    return userCreated;
  } catch (error) {
    if (sequelizeTransaction) await sequelizeTransaction.rollback();
    logger.error(error);
  }
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
const queryUsers = async (filter, options) => {
  if (options.sortBy !== undefined) {
    const [sortBy, direction] = options.sortBy.split(':');
    if (Object.keys(db.transactions.rawAttributes).includes(sortBy)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid column name for user`);
    }
    if (['asc', 'desc'].includes(direction.toLowerCase())) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid order`);
    }

    // eslint-disable-next-line no-param-reassign
    options.order = [[options.sortBy, options.direction]];
  }
  const users = await db.users.paginate({
    where: filter,
    ...options,
    include: db.roles,
  }); // .paginate(filter, options);
  return {
    ...users,
    docs: users.docs.map((user) => filterUser(user)),
  };
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await db.users.findByPk(id, { include: db.roles });
  return filterUser(user);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return filterUser(
    await db.users.findOne({
      where: { email },
      include: {
        model: db.roles,
        as: 'roles',
        attributes: ['name'],
        through: { attributes: [] },
      },
    })
  );
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await db.users.update(user, { where: { id: userId } });
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await db.users.destroy(user);
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  isPasswordMatch,
};
