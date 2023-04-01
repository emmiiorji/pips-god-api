const sequelizePaginate = require('sequelize-paginate');
const { resourceTypes } = require('../config/constants');

module.exports = (sequelize, dataType) => {
  const CourseResource = sequelize.define('course_resource', {
    type: {
      type: dataType.ENUM(...Object.values(resourceTypes)),
      allowNull: false,
      trim: true,
    },
    description: {
      type: dataType.STRING,
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
    },
    text: {
      type: dataType.TEXT,
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
