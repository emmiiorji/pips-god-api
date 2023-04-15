const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize) => {
  const userRole = sequelize.define('user_role', {});

  sequelizePaginate.paginate(userRole);
  return userRole;
};
