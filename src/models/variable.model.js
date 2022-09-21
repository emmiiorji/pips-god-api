module.exports = (sequelize, dataType) => {
  const variables = sequelize.define('variables', {
    name: {
      type: dataType.STRING,
      allowNull: false,
      trim: true,
    },
  });

  return variables;
};
