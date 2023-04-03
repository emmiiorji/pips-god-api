const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const CourseModule = sequelize.define('course_module', {
    description: {
      type: dataType.STRING,
      trim: true,
    },
    title: {
      type: dataType.STRING,
      trim: true,
      unique: true,
    },
    tags: {
      type: dataType.STRING,
      trim: true,
    },
    logo: {
      type: dataType.STRING,
      trim: true,
    },
    sequenceNo: {
      type: dataType.INTEGER,
      autoIncrement: true,
    },
    thumbnail: {
      type: dataType.STRING,
      trim: true,
    },
  });

  sequelizePaginate.paginate(CourseModule);
  return CourseModule;
};
