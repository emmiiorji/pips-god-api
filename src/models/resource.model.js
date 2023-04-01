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
  });

  sequelizePaginate.paginate(CourseResource);
  return CourseResource;
};
