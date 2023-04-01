const sequelizePaginate = require('sequelize-paginate');
const { resourceTypes } = require('../config/constants');

module.exports = (sequelize, dataType) => {
  const CourseResource = sequelize.define('course_resource', {
    type: {
      type: dataType.ENUM(...Object.values(resourceTypes)),
      allowNull: false,
      trim: true,
    },
    sequenceNo: {
      type: dataType.INTEGER,
      allowNull: false,
      unique: true,
    },
    url: {
      type: dataType.STRING,
      trim: true,
      allowNull: false,
    },
  });

  sequelizePaginate.paginate(CourseResource);
  return CourseResource;
};
