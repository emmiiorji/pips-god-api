const resourceTypes = {
  TEXT: 'text',
  VIDEO: 'video',
  IMAGE: 'image',
};

const dateUnits = {
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months',
  YEARS: 'years',
};

const subscriptionNames = {
  VIP_SIGNALS: 'vip_signals',
  TRAINING_AND_MENTORING: 'training_and_mentoring',
};

const notificationStatusTypes = {
  READ: 'read',
  UNREAD: 'unread',
};

const transactionStatuses = {
  SUCCESS: 'success',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
  ERROR: 'error',
  INITIATED: 'initiated',
  PARTIALLY_PAID: 'partially_paid',
};

const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
};

const rolesAndRights = async () => {
  // eslint-disable-next-line global-require
  const { db } = require('../models');
  const roles = await db.roles.findAll({ include: ['permissions'] });
  const roleRights = new Map();
  roles.forEach((role) => {
    roleRights.set(
      role.name,
      role.permissions.map((p) => p.value)
    );
  });
  return { roles: roles.map((role) => role.name), roleRights };
};

module.exports = {
  dateUnits,
  resourceTypes,
  notificationStatusTypes,
  rolesAndRights,
  subscriptionNames,
  transactionStatuses,
  tokenTypes,
};
