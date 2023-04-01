const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, dataType) => {
  const ResourceTitle = sequelize.define('resource_title', {
    description: {
      type: dataType.STRING,
      trim: true,
    },
    text: {
      type: dataType.TEXT,
      trim: true,
    },
  });

  sequelizePaginate.paginate(ResourceTitle);
  return ResourceTitle;
};
