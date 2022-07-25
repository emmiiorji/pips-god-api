const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const Course = sequelize.define('course', {
    name: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
      unique: true,
    },
    sequenceNo: {
      type: dataType.INTEGER,
      allowNull: false,
      unique: true,
    },
    textMaterial: {
      type: dataType.STRING,
      defaultValue: false,
    },
    video: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
    logo: {
      type: dataType.STRING,
      trim: true,
    },
  });

  sequelizePaginate.paginate(Course);
  return Course;
};
