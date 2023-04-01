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

const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers', 'manageSubscriptions', 'manageTransactions'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  dateUnits,
  resourceTypes,
  notificationStatusTypes,
  roles,
  roleRights,
  subscriptionNames,
  transactionStatuses,
  tokenTypes,
};
