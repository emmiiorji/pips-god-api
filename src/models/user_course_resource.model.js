const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const UserCourseResource = sequelize.define('user_course_resource', {
    isCompleted: {
      type: dataType.BOOLEAN,
      defaultValue: false,
    },
  });

  sequelizePaginate.paginate(UserCourseResource);
  return UserCourseResource;
};
