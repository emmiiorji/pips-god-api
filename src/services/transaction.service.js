const httpStatus = require('http-status');
const { nanoid } = require('nanoid');
const paystack = require('paystack')(require('../config/config').paystack.secretKey);
const { client } = require('../config/config');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');
const { transactionStatuses } = require('../config/constants');
const { emailService } = require('.');
const { subscriptionNames } = require('../config/constants');
const logger = require('../config/logger');
const { isEmailTaken } = require('./user.service');

const camelToCapitalized = (str) => {
  let words = str.match(/[A-Z][a-z]+/g);
  const firstWord = str.match(/[a-z]+[A-Z]?/g);
  words = words ? [firstWord[0].slice(0, -1), ...words] : firstWord;

  for (let i = 0; i < words.length; i += 1) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }

  return words.join(' ');
};

const getPaystackCustomFields = (metadata) => {
  const customFields = [];
  Object.keys(metadata).forEach((key) => {
    customFields.push({
      display_name: camelToCapitalized(key),
      variable_name: key,
      value: metadata[key],
    });
  });
  return customFields;
};

/**
 * Initialize a transaction
 * @param {Object} transactionBody
 * @returns {Promise<Object>}
 */
const initializeTransaction = async (transactionBody, isRenew = false) => {
  const isVipSignals = transactionBody.subscriptionPlanName === subscriptionNames.VIP_SIGNALS;

  let firstName;
  let lastName;
  if (isVipSignals) {
    firstName = camelToCapitalized(transactionBody.firstName);
    lastName = camelToCapitalized(transactionBody.lastName);
  }
  const { email, currency, subscriptionPlanName, ...metadata } = {
    ...transactionBody,
    firstName,
    lastName,
    email: transactionBody.email.toLowerCase(),
  };
  if (transactionBody.middleName) metadata.middleName = camelToCapitalized(transactionBody.middleName);

  const subscriptionPlan = await db.subscription_plans.findOne({
    where: { name: subscriptionPlanName },
  });

  if (!subscriptionPlan) throw new ApiError(httpStatus.NOT_FOUND, 'Subscription plan not found');

  if (isVipSignals) {
    metadata.telegramUsername = metadata.telegramUsername.toLowerCase();
    const { telegramUsername } = metadata;
    let user = await db.users.findOne({ where: { telegramUsername } });
    if (user && !isRenew) throw new ApiError(httpStatus.IM_USED, 'User with telegram username already exists');

    user = await db.users.findOne({ where: { email }, include: [{ model: db.roles, attributes: ['name'] }] });
    const userRoles = user.roles.map((role) => role.name);
    if (userRoles.includes('user') && !isRenew)
      throw new ApiError(httpStatus.ALREADY_REPORTED, 'User with email already exists');
  }

  const transactionId = nanoid();
  const result = await paystack.transaction.initialize(
    {
      email,
      amount: subscriptionPlan.price, // in kobo (100 kobo = 1 naira)
      currency: currency || 'NGN',
      callback_url: `${client.baseUrlHosted}/paystack/success/${transactionId}?vip_signal=${
        isVipSignals ? 'true' : 'false'
      }`,
      metadata: {
        custom_fields: getPaystackCustomFields({ ...metadata, email }),
      },
    },
    async (error, body) => {
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
const verifyTransaction = async (transactionId, isRenew = false) => {
  const transaction = await db.transactions.findOne({ where: { id: transactionId } });

  if (!transaction) throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  if (transaction.isUsed) throw new ApiError(httpStatus.CONFLICT, 'This transaction has been used before');

  const subscriptionPlan = await db.subscription_plans.findOne({ where: { id: transaction.subscriptionPlanId } });
  const isVipSignals = subscriptionPlan.name === subscriptionNames.VIP_SIGNALS;

  try {
    const response = await paystack.transaction.verify(transaction.reference);
    if (!(response.data.amount === transaction.amount) && response.data.status === 'success') {
      await transaction.update({ status: transactionStatuses.PARTIALLY_PAID });
    } else if (transaction.status !== response.data.status) {
      await db.transactions.update({ status: response.data.status }, { where: { id: transaction.id } });
    }
    if (response.data.status !== 'success') return { status: response.data.status };

    // Record the transaction as a subscription

    let sequelizeTransaction;
    if (isVipSignals) {
      try {
        // Use a transaction to create the user and subscription
        const user = response.data.metadata.custom_fields.reduce((acc, field) => {
          acc[field.variable_name] = field.value;
          return acc;
        }, {});
        sequelizeTransaction = await db.sequelize.transaction();
        const { oldUser } = await isEmailTaken(user.email, 'user');

        const userCreated = oldUser || (await db.users.create(user));

        // userCreated = !emailTaken ? oldUser : await db.users.create(user, { transaction: sequelizeTransaction });

        const userRole = await db.roles.findOne({ where: { name: 'user' } });
        await userCreated.addRole(userRole.id, { transaction: sequelizeTransaction });
        await db.subscriptions.create(
          {
            userId: userCreated.id,
            transactionId: transaction.id,
            subscriptionPlanId: transaction.subscriptionPlanId,
            validity: subscriptionPlan.validity,
            validityUnit: subscriptionPlan.validityUnit,
          },
          { transaction: sequelizeTransaction }
        );

        await db.transactions.update({ isUsed: true }, { where: { id: transaction.id }, transaction: sequelizeTransaction });

        await emailService.sendVipSignalsEmail(userCreated.firstName, transaction, subscriptionPlan);
        await sequelizeTransaction.commit();
        return { status: response.data.status };
      } catch (error) {
        if (sequelizeTransaction) await sequelizeTransaction.rollback();
        logger.error(error);
        throw new ApiError(httpStatus.BAD_REQUEST, 'An error occurred');
      }
    }

    if (!isRenew) {
      const registrationUrl = `${client.baseUrlHosted}/register/${transaction.id}`; // Change access code to transaction id

      // Todo
      // Only send registration link if it's a registration.

      if (!transaction.sentRegistrationEmail) {
        await emailService.sendRegistrationEmail(transaction, registrationUrl, subscriptionPlan.title);
        await db.transactions.update({ sentRegistrationEmail: true }, { where: { id: transaction.id } });
      }
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
    if (!Object.keys(db.transactions.rawAttributes).includes(sortBy)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid column name for transaction`);
    }
    if (!['asc', 'desc'].includes(direction.toLowerCase())) {
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
