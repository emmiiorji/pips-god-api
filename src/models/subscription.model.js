const sequelizePaginate = require('sequelize-paginate');

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
  });

  sequelizePaginate.paginate(subscription);
  return subscription;
};
