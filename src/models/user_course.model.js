const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const userCourse = sequelize.define('user_course', {
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
