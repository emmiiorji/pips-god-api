const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const role = sequelize.define('role', {
    name: {
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
  });

  sequelizePaginate.paginate(role);
  return role;
};
