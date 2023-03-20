const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const permission = sequelize.define('permission', {
    name: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
      unique: true,
    },
    value: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
      unique: true,
    },
    description: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    groupName: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
  });

  sequelizePaginate.paginate(permission);
  return permission;
};
