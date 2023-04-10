const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const userCourse = sequelize.define('user_course', {
    startDate: {
      type: dataType.DATE,
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
    startedAt: {
      type: dataType.DATE,
    },
    completedAt: {
      type: dataType.DATE,
    },
  });

  sequelizePaginate.paginate(userCourse);
  return userCourse;
};
