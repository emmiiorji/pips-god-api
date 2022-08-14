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

module.exports = {
  createDummySubscriptionPlans,
};
