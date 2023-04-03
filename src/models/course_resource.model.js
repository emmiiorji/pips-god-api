const sequelizePaginate = require('sequelize-paginate');
const { resourceTypes } = require('../config/constants');

module.exports = (sequelize, dataType) => {
  const CourseResource = sequelize.define('course_resource', {
    courseId: {
      type: dataType.INTEGER,
      allowNull: false,
    },
    courseModuleId: {
      type: dataType.INTEGER,
      allowNull: false,
    },
    type: {
      type: dataType.ENUM(...Object.values(resourceTypes)),
      allowNull: false,
      trim: true,
    },
    description: {
      type: dataType.STRING,
      trim: true,
    },
    url: {
      type: dataType.STRING,
      trim: true,
    },
    thumbnail: {
      type: dataType.STRING,
      trim: true,
    },
  });

  sequelizePaginate.paginate(CourseResource);
  return CourseResource;
};
