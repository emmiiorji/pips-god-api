const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize) => {
  const subscription = sequelize.define('subscription', {});

  sequelizePaginate.paginate(subscription);
  return subscription;
};
