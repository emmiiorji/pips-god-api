const sequelizePaginate = require('sequelize-paginate');

const { notificationStatusTypes } = require('../config/constants');

module.exports = (sequelize, dataType) => {
  const notification = sequelize.define('notification', {
    title: {
      type: dataType.STRING(100),
      trim: true,
      allowNull: false,
    },
    body: {
      type: dataType.TEXT,
      trim: true,
      allowNull: false,
    },
    status: {
      type: dataType.ENUM(...Object.values(notificationStatusTypes)),
      defaultValue: notificationStatusTypes.UNREAD,
    },
  });

  sequelizePaginate.paginate(notification);
  return notification;
};
