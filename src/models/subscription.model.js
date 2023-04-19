const sequelizePaginate = require('sequelize-paginate');
const { dateUnits } = require('../config/constants');

module.exports = (sequelize, dataType) => {
  const subscription = sequelize.define('subscription', {
    transactionId: {
      type: dataType.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: {
      type: dataType.STRING,
      allowNull: false,
      primaryKey: true,
    },
    subscriptionPlanId: {
      type: dataType.STRING,
      allowNull: false,
      primaryKey: true,
    },
    isValid: {
      type: dataType.BOOLEAN,
      defaultValue: true,
    },
    validity: {
      type: dataType.INTEGER,
      allowNull: false,
      trim: true,
    },
    validityUnit: {
      type: dataType.STRING,
      defaultValue: dateUnits.DAYS,
    },
    count: {
      type: dataType.INTEGER,
      defaultValue: 1,
    },
  });

  sequelizePaginate.paginate(subscription);
  return subscription;
};
