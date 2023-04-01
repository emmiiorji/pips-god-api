const sequelizePaginate = require('sequelize-paginate');
const { dateUnits } = require('../config/constants');

module.exports = (sequelize, dataType) => {
  const subscriptionPlan = sequelize.define('subscription_plan', {
    title: {
      type: dataType.STRING,
      unique: true,
      allowNull: false,
      trim: true,
    },
    name: {
      type: dataType.STRING,
      unique: true,
      allowNull: false,
      trim: true,
    },
    price: {
      type: dataType.INTEGER,
      allowNull: false,
    },
    priceUnit: {
      type: dataType.STRING,
      defaultValue: 'kobo',
    },
    validity: {
      type: dataType.INTEGER,
      defaultValue: 30,
    },
    validityUnit: {
      type: dataType.ENUM(...Object.values(dateUnits)),
      defaultValue: dateUnits.DAYS,
    },
    telegramGroupUrl: {
      type: dataType.STRING,
      trim: true,
    },
  });

  sequelizePaginate.paginate(subscriptionPlan);
  return subscriptionPlan;
};
