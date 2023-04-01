const Joi = require('joi');
const { notificationStatusTypes } = require('../config/constants');

const createNotification = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    status: Joi.string().valid(...Object.values(notificationStatusTypes)),
    userId: Joi.string().required(),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    status: Joi.string().valid(...Object.values(notificationStatusTypes)),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNotification = {
  params: Joi.object().keys({
    notificationId: Joi.number().integer().required(),
  }),
};

const updateNotification = {
  params: Joi.object().keys({
    notificationId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      status: Joi.string().valid(...Object.values(notificationStatusTypes)),
      scheduleId: Joi.number().integer(),
    })
    .min(1),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createNotification,
  getNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
};
