const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const userCourse = sequelize.define('user_course', {
    startDate: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    isStarted: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
    isCompleted: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
  });

  sequelizePaginate.paginate(userCourse);
  return userCourse;
};
