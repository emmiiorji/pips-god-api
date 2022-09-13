const logger = require('../config/logger');
const { db } = require('../models');

const createDummySubscriptionPlans = async () => {
  const dummyPlans = [
    {
      name: 'vip_signals',
      price: '1000000',
    },
    {
      name: 'training_and_mentoring',
      price: '1200000',
    },
  ];

  // Get existing plans
  const allPlans = await db.subscription_plans.findAll();

  // Create the plans in dummyPlans that don't exist
  if (allPlans.length === 0 || allPlans.length !== dummyPlans.length) {
    const filteredPlans = dummyPlans.filter((plan) => !allPlans.find((p) => p.name === plan.name));
    await db.subscription_plans.bulkCreate(filteredPlans);
    logger.info('Created dummy subscription plans');
  }
};
const createDummyRoles = async () => {
  const dummyRoles = [
    {
      name: 'admin',
      description: 'An admin user',
    },
    {
      name: 'user',
      description: 'A normal user',
    },
    {
      name: 'superuser',
      description: 'Admin of admins',
    },
  ];

  // Get existing plans
  const allRoles = await db.roles.findAll();

  // Create the plans in dummyPlans that don't exist
  if (allRoles.length === 0 || allRoles.length !== dummyRoles.length) {
    const filteredRoles = dummyRoles.filter((role) => !allRoles.find((r) => r.name === role.name));
    await db.roles.bulkCreate(filteredRoles);
    logger.info('Created dummy roles');
  }
};

module.exports = {
  createDummySubscriptionPlans,
  createDummyRoles,
};
