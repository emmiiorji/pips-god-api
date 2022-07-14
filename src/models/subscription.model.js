const { dateUnits } = require('../config/dateUnits');

module.exports = (sequelize, dataType) => {
  const subscription = sequelize.define('subscription', {
    validity: {
      type: dataType.INTEGER,
      defaultValue: 30,
    },
    validityUnit: {
      type: dataType.ENUM(...Object.values(dateUnits)),
      defaultValue: dateUnits.DAYS,
    },
  });

  return subscription;
};
