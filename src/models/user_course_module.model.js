const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const UserCourseModule = sequelize.define('user_course_module', {
    isCompleted: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: dataType.DATE,
    },
    isStarted: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
    startedAt: {
      type: dataType.DATE,
    },
  });

  sequelizePaginate.paginate(UserCourseModule);
  return UserCourseModule;
};
