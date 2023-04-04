const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');
const logger = require('../config/logger');
const { resourceTypes } = require('../config/constants');

// Course Resource is created at the same time as the Course Module
const createCourseModule = async (courseResourceBody) => {
  const { courseModule, courseResources } = courseResourceBody;
  const featuredCourse = await db.courses.findByPk(courseModule.courseId);

  if (!featuredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'COURSE_NOT_FOUND');
  }
  const existingCourseModuleTitle = await db.course_modules.findOne({ where: { title: courseModule.title } });
  if (existingCourseModuleTitle) {
    throw new ApiError(httpStatus.ALREADY_REPORTED, 'COURSE_MODULE_TITLE_ALREADY_EXISTS');
  }

  const sequelizeTransaction = await db.sequelize.transaction();
  try {
    const createdCourseModule = await db.course_modules.create(courseModule, { transaction: sequelizeTransaction });
    const createdCourseResources = await db.course_resources.bulkCreate(
      courseResources.map((courseResource) => {
        if (courseResource.type === resourceTypes.VIDEO) {
          if (courseResource.thumbnail === undefined) {
            // eslint-disable-next-line no-throw-literal
            throw 'VIDEO_THUMBNAIL_REQUIRED';
          }
        }
        return {
          ...courseResource,
          courseModuleId: createdCourseModule.id,
          courseId: featuredCourse.id,
        };
      }),
      { transaction: sequelizeTransaction }
    );

    await sequelizeTransaction.commit();
    return { ...courseModule, course_resources: createdCourseResources };
  } catch (error) {
    await sequelizeTransaction.rollback();
    logger.error(error);
    if (error === 'VIDEO_THUMBNAIL_REQUIRED') {
      throw new ApiError(httpStatus.BAD_REQUEST, error);
    }
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating course resource');
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCourseModules = async (filter, options) => {
  if (options.sortBy !== undefined) {
    const [sortBy, direction] = options.sortBy.split(':');
    if (!Object.keys(db.course_resources.rawAttributes).includes(sortBy)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid column name for user`);
    }
    if (!['asc', 'desc'].includes(direction.toLowerCase())) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid order`);
    }

    // eslint-disable-next-line no-param-reassign
    options.order = [[options.sortBy, options.direction]];
  }
  const courseResources = await db.course_modules.paginate({
    where: filter,
    ...options,
    include: { model: db.course_resources, attributes: { exclude: ['createdAt', 'updatedAt'] } },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  }); // .paginate(filter, options);
  return courseResources;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<CourseModule>}
 */
const getCourseModuleById = async (id) => {
  const courseResource = await db.course_resources.findByPk(id, {
    include: { model: db.course_modules, attributes: { exclude: ['createdAt', 'updatedAt'] } },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  });
  return courseResource;
};

/**
 * Update user by id
 * @param {ObjectId} courseResourceId
 * @param {Object} updateBody
 * @returns {Promise<CourseModule>}
 */
// const updateCourseModuleById = async (courseResourceId, updateBody) => {
//   const courseResource = await getCourseModuleById(courseResourceId);
//   if (!courseResource) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   if (updateBody.email && (await isEmailTaken(updateBody.email, userId))) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
//   }
//   Object.assign(user, updateBody);
//   await db.users.update(user, { where: { id: userId } });
//   return user;
// };

/**
 * Delete user by id
 * @param {ObjectId} courseModuleId
 * @returns {Promise<CourseModule>}
 */
const deleteCourseModuleById = async (id) => {
  const courseModule = await getCourseModuleById(id);
  if (!courseModule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course Module not found');
  }
  await db.course_modules.destroy({ where: { id } });
  return courseModule;
};

module.exports = {
  createCourseModule,
  queryCourseModules,
  getCourseModuleById,
  // updateCourseModuleById,
  deleteCourseModuleById,
};
