const Joi = require('joi');
const { resourceTypes } = require('../config/constants');
const { tags } = require('./custom.validation');

const createCourseModule = {
  body: Joi.object().keys({
    courseModule: Joi.object()
      .keys({
        description: Joi.string(),
        title: Joi.string().required(),
        tags: Joi.string().required().custom(tags),
        logo: Joi.string(),
        thumbnail: Joi.string(),
        courseId: Joi.number().integer().required(),
      })
      .required(),
    courseResources: Joi.array()
      .items(
        Joi.object().keys({
          type: Joi.string()
            .valid(...Object.values(resourceTypes))
            .required(),
          description: Joi.string(),
          url: Joi.string().required(),
          thumbnail: Joi.string(),
        })
      )
      .min(2)
      .required(),
  }),
};

const getCourseModules = {
  query: Joi.object().keys({
    description: Joi.string(),
    title: Joi.string(),
    tags: Joi.string().custom(tags),
    logo: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCourseModule = {
  params: Joi.object().keys({
    courseModuleId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    role: Joi.string().default('admin'),
  }),
};

const updateCourseModule = {
  params: Joi.object().keys({
    courseModuleId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    courseModule: Joi.object().keys({
      courseModuleId: Joi.number().integer(),
      description: Joi.string(),
      title: Joi.string(),
      tags: Joi.string().custom(tags),
      logo: Joi.string(),
      thumbnail: Joi.string(),
    }),
    courseResources: Joi.array().items(
      Joi.object().keys({
        id: Joi.number().integer().required(),
        courseResourceId: Joi.number().integer(),
        type: Joi.string()
          .valid(...Object.values(resourceTypes))
          .required(),
        description: Joi.string(),
        url: Joi.string(),
        thumbnail: Joi.string(),
      })
    ),
  }),
};

const deleteCourseModule = {
  params: Joi.object().keys({
    courseModuleId: Joi.string(),
  }),
};

module.exports = {
  createCourseModule,
  getCourseModules,
  getCourseModule,
  updateCourseModule,
  deleteCourseModule,
};
