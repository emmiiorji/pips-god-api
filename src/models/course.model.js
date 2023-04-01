const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const Course = sequelize.define('course', {
    name: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
      unique: true,
    },
    description: {
      type: dataType.TEXT,
      trim: true,
    },
    logo: {
      type: dataType.STRING,
      trim: true,
    },
    thumbnail: {
      type: dataType.STRING,
      trim: true,
    },
  });

  sequelizePaginate.paginate(Course);
  return Course;
};
