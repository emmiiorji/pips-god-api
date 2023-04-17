const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { sequelize } = require('../config/config');
const logger = require('../config/logger');

const sequelizeInstance = new Sequelize(sequelize.url);
const db = {};

/*
const sequelizeInstance = new Sequelize(sequelize.database, sequelize.user, sequelize.password, {
  host: sequelize.host,
  dialect: sequelize.dialect,
  pool: {
    min: 0,
    max: 100,
    acquire: 5000,
    Idle: 1000
  },
});
*/
sequelizeInstance
  .authenticate()
  .then(() => logger.info('DB connected'))
  .catch((err) => {
    logger.error(err);
  });

db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;
db.Op = Op;

db.users = require('./user.model')(sequelizeInstance, Sequelize);
db.tokens = require('./token.model')(sequelizeInstance, Sequelize);
db.subscriptions = require('./subscription.model')(sequelizeInstance, Sequelize);
db.transactions = require('./transaction.model')(sequelizeInstance, Sequelize);
db.subscription_plans = require('./subscription_plan.model')(sequelizeInstance, Sequelize);
db.subscriptions = require('./subscription.model')(sequelizeInstance, Sequelize);
db.roles = require('./role.model')(sequelizeInstance, Sequelize);
db.user_courses = require('./user_course.model')(sequelizeInstance, Sequelize);
db.permissions = require('./permission.model')(sequelizeInstance, Sequelize);
db.courses = require('./course.model')(sequelizeInstance, Sequelize);
db.notifications = require('./notification.model')(sequelizeInstance, Sequelize);
db.message_templates = require('./message_template.model')(sequelizeInstance, Sequelize);
db.message_variables = require('./variable.model')(sequelizeInstance, Sequelize);
db.course_resources = require('./course_resource.model')(sequelizeInstance, Sequelize);
db.user_course_modules = require('./user_course_module.model')(sequelizeInstance, Sequelize);
db.course_modules = require('./course_module.model')(sequelizeInstance, Sequelize);
db.user_roles = require('./user_role.model')(sequelizeInstance, Sequelize);
db.contact_messages = require('./contact_message.model')(sequelizeInstance, Sequelize);

// relationships for models

//= ==============================
// Define all relationships here below
//= ==============================
// user to role m-m
db.users.belongsToMany(db.roles, { through: 'user_roles' });
db.roles.belongsToMany(db.users, { through: 'user_roles' });

// user to token 1-m
db.users.hasMany(db.tokens);
db.tokens.belongsTo(db.users, { foreignKey: { allowNull: false } });

// role to permission
db.roles.belongsToMany(db.permissions, { through: 'role_permissions' });
db.permissions.belongsToMany(db.roles, { through: 'role_permissions' });

// user to role m-m
db.users.belongsToMany(db.roles, { through: 'user_roles' });
db.roles.belongsToMany(db.users, { through: 'user_roles' });

// user to course m-m
db.users.belongsToMany(db.courses, { through: db.user_courses });
db.courses.belongsToMany(db.users, { through: db.user_courses });

// user to subscription plan m-m
db.users.belongsToMany(db.subscription_plans, { through: db.subscriptions });
db.subscription_plans.belongsToMany(db.users, { through: db.subscriptions });

// user to subscription 1-m
db.subscriptions.belongsTo(db.subscription_plans, { foreignKey: { allowNull: false } });

// course to resource 1-m
db.courses.hasMany(db.course_resources);
db.course_resources.belongsTo(db.courses);

// user to course module m-m
db.users.belongsToMany(db.course_modules, { through: db.user_course_modules });
db.course_resources.belongsToMany(db.users, { through: db.user_course_modules });

// course_module to user_course_module 1-m
db.user_course_modules.belongsTo(db.course_modules);

// course to course_resource 1-m
db.courses.hasMany(db.course_resources);
db.course_resources.belongsTo(db.courses);

// course_module to course_resource 1-m
db.course_modules.hasMany(db.course_resources);
db.course_resources.belongsTo(db.course_modules);

// course to subscription_plan 1-1
db.courses.belongsTo(db.subscription_plans);
db.subscription_plans.hasOne(db.courses);

// subscription to transaction 1-1
db.subscriptions.belongsTo(db.transactions);
db.transactions.hasOne(db.subscriptions);

// subscriptionPlan to transaction 1-m
db.transactions.belongsTo(db.subscription_plans, { foreignKey: { allowNull: false } });
db.subscription_plans.hasMany(db.transactions);

// User - Notification (1:m)
db.notifications.belongsTo(db.users, { foreignKey: { allowNull: false } });
db.users.hasMany(db.notifications);

// message template to variables m-m
db.message_templates.belongsToMany(db.message_variables, { through: 'message_template_variables', onDelete: 'cascade' });
db.message_variables.belongsToMany(db.message_templates, { through: 'message_variables' });

module.exports = {
  db,
};
