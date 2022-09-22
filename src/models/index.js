const Sequelize = require('sequelize');
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
db.users.belongsToMany(db.permissions, { through: 'role_permissions' });
db.permissions.belongsToMany(db.users, { through: 'role_permissions' });

// user to role m-m
db.users.belongsToMany(db.roles, { through: 'user_roles' });
db.roles.belongsToMany(db.users, { through: 'user_roles' });

// user to course m-m
db.users.belongsToMany(db.courses, { through: db.user_courses });
db.courses.belongsToMany(db.users, { through: db.user_courses });

// user to subscription plan m-m
db.users.belongsToMany(db.subscription_plans, { through: db.subscriptions });
db.subscription_plans.belongsToMany(db.users, { through: db.subscriptions });

// subscription to user course 1-m
db.user_courses.belongsTo(db.subscriptions, { foreignKey: { allowNull: false } });
db.subscriptions.hasMany(db.user_courses);

// subscription to transaction 1-1
db.subscriptions.belongsTo(db.transactions);
db.transactions.hasOne(db.subscriptions);

// subscriptionPlan to transaction 1-m
db.transactions.belongsTo(db.subscription_plans, { foreignKey: { allowNull: false } });
db.subscription_plans.hasMany(db.transactions);

// User - Notification (1:m)
db.notifications.belongsTo(db.users, { foreignKey: { allowNull: false } });
db.users.hasMany(db.notifications);
module.exports = {
  db,
};
