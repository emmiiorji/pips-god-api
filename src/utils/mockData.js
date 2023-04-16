const bcrypt = require('bcryptjs');
const { superAdminUsers, bCrypt } = require('../config/config');
const logger = require('../config/logger');
const { subscriptionNames } = require('../config/constants');
const { db } = require('../models');

const createSeedSubscriptionPlans = async () => {
  const seedPlans = [
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

  // Create the plans in seedPlans that don't exist
  if (allPlans.length === 0 || allPlans.length !== seedPlans.length) {
    const filteredPlans = seedPlans.filter((plan) => !allPlans.find((p) => p.name === plan.name));
    await db.subscription_plans.bulkCreate(filteredPlans);
    logger.info('Created seed subscription plans');
  }
};
const createSeedRoles = async () => {
  const seedRoles = [
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

  // Create the plans in seedPlans that don't exist
  if (allRoles.length === 0 || allRoles.length !== seedRoles.length) {
    const filteredRoles = seedRoles.filter((role) => !allRoles.find((r) => r.name === role.name));
    await db.roles.bulkCreate(filteredRoles);
    logger.info('Created Seed roles');
  }
};

const createSuperAdminUsers = async () => {
  Object.values(superAdminUsers).forEach(async (user) => {
    const existingUser = await db.users.findOne({
      where: { [db.Op.or]: [{ username: user.username }, { email: user.email }] },
      include: ['roles'],
    });

    // eslint-disable-next-line no-param-reassign
    user.password = bcrypt.hashSync(user.password, bCrypt.salt || 10);

    if (existingUser) {
      logger.info(`User with username ${user.username} or email ${user.email} already exists`);
      if (existingUser.roles.find((role) => role.name === 'super_admin')) {
        logger.info(`User with username ${user.username} or email ${user.email} is already a super admin`);
        logger.info('Changing Password...');
        await existingUser.update({ password: user.password });
      }
      return;
    }
    const newUser = await db.users.create(user);
    const superAdminRole = await db.roles.findOne({ where: { name: 'super_admin' } });
    await newUser.addRole(superAdminRole);
  });
};

const createPermissions = async () => {
  const permissions = [
    {
      name: 'Create Admin User',
      value: 'admin_user.create',
      description: 'Create an admin user',
      groupName: 'User Permissions',
      roles: ['super_admin'],
    },
    {
      name: 'Manage Users',
      value: 'users.manage',
      description: 'Manage users',
      groupName: 'User Permissions',
      roles: ['super_admin', 'admin'],
    },
    {
      name: 'Manage Course Modules',
      value: 'course_modules.manage',
      description: 'Manage course modules',
      groupName: 'Course Module Permissions',
      roles: ['super_admin', 'admin'],
    },
    {
      name: 'Manage Contact Messages',
      value: 'contact_messages.manage',
      description: 'Manage contact us messages',
      groupName: 'Contact Messages Permissions',
      roles: ['super_admin', 'admin'],
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
    const createdPermissions = filteredPermissions.map((permission) => db.permissions.create(permission));
    await Promise.all(createdPermissions);
    logger.info('permissions created');
  }

  const setPermissions = async (permission, roles) => {
    const permissionInstance = await db.permissions.findOne({ where: { value: permission } });
    const roleInstances = await db.roles.findAll({ where: { name: roles } });
    await permissionInstance.setRoles(roleInstances);
  };

  permissions.forEach(async (permission) => {
    await setPermissions(permission.value, permission.roles);
  });
};

const createSeedCourses = async () => {
  const trainingAndMentoringCourse = {
    name: subscriptionNames.TRAINING_AND_MENTORING,
    description: 'Learn how to trade forex',
    tags: 'forex, trading',
  };

  const trainingAndMentoring = await db.courses.findOne({
    where: { name: subscriptionNames.TRAINING_AND_MENTORING },
  });
  const trainingSubscription = await db.subscription_plans.findOne({
    where: { name: subscriptionNames.TRAINING_AND_MENTORING },
  });
  if (!trainingAndMentoring) {
    if (trainingSubscription) {
      trainingAndMentoringCourse.subscriptionPlanId = trainingSubscription.id;
      await db.courses.create(trainingAndMentoringCourse);
    }
  }
  logger.info('Training and Mentoring course created');
};

module.exports = {
  createSeedSubscriptionPlans,
  createSeedRoles,
  createSuperAdminUsers,
  createPermissions,
  createSeedCourses,
};
