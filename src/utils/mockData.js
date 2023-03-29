const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { superAdminUsers, bCrypt } = require('../config/config');
const logger = require('../config/logger');
const { subscriptionNames } = require('../config/subscriptionPlanNames');
const { db } = require('../models');

const createDummySubscriptionPlans = async () => {
  const dummyPlans = [
    {
      title: 'VIP Signals',
      name: subscriptionNames.VIP_SIGNALS,
      price: '1000000',
      telegramGroupUrl: 'https://t.me/examplegroup',
    },
    {
      title: 'Training and Mentoring',
      name: subscriptionNames.TRAINING_AND_MENTORING,
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
      name: 'super_admin',
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

const createSuperAdminUsers = async () => {
  const superAdmins = await db.users.findAll({
    include: [{ model: db.roles, where: { name: 'super_admin' } }],
  });

  if (superAdmins.length > 0) await db.users.destroy({ where: { id: superAdmins.map((user) => user.id) } });
  Object.values(superAdminUsers).forEach(async (user) => {
    // const superAdmins = await db.users.findAll({ where: { [Op.or]: [{ username: user.username }, { email: user.email }] } });

    // eslint-disable-next-line no-param-reassign
    user.password = bcrypt.hashSync(user.password, bCrypt.salt || 10);
    const newUser = await db.users.create(user);
    const superAdminRole = await db.roles.findOne({ where: { name: 'super_admin' } });
    await newUser.addRole(superAdminRole);
  });
};

const setSuperAdminPermissions = async () => {
  const superAdminRole = await db.roles.findOne({ where: { name: 'super_admin' } });
  const allPermissions = await db.permissions.findAll();
  await superAdminRole.setPermissions(allPermissions);
};

const setAdminPermissions = async () => {
  const adminRole = await db.roles.findOne({ where: { name: 'admin' } });
  const allPermissions = await db.permissions.findAll({ where: { value: { [Op.notLike]: 'admin_user.%' } } });
  await adminRole.setPermissions(allPermissions);
};

const createPermissions = async () => {
  const permissions = [
    {
      name: 'Create Admin User',
      value: 'admin_user.create',
      description: 'Create an admin user',
      groupName: 'User Permissions',
    },
    {
      name: 'Manage Users',
      value: 'users.manage',
      description: 'Manage users',
      groupName: 'User Permissions',
    },
  ];

  //   get existing permissions
  const allPermissions = await db.permissions.findAll();

  //   if permission is empty bulk create permissions
  if (allPermissions.length === 0 || allPermissions.length !== permissions.length) {
    // filter for permissions that do not exist
    const filteredPermissions = permissions.filter(
      (permission) => !allPermissions.find((l) => l.dataValues.value === permission.value)
    );
    filteredPermissions.forEach(async (permission) => {
      // TODO: add permission service
      await db.permissions.create(permission);
    });
    logger.info('permissions created');
  }

  setSuperAdminPermissions();
  setAdminPermissions();
};

module.exports = {
  createDummySubscriptionPlans,
  createDummyRoles,
  createSuperAdminUsers,
  createPermissions,
};
