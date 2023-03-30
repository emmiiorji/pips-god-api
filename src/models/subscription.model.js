const sequelizePaginate = require('sequelize-paginate');
const { dateUnits } = require('../config/dateUnits');

module.exports = (sequelize, dataType) => {
  const subscription = sequelize.define('subscription', {
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
  });

  sequelizePaginate.paginate(subscription);
  return subscription;
};
