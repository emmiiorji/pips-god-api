const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');
const logger = require('../config/logger');
const { resourceTypes } = require('../config/constants');

const titleExists = async (title) => {
  const courseModule = await db.course_modules.findOne({ where: { title } });
  return courseModule;
};

const isResourceTypesUnique = (courseResources) => {
  // Check if there's a repeating resource type
  const types = courseResources.map((courseResource) => courseResource.type);
  const uniqueResourceTypes = [...new Set(types)];
  if (types.length !== uniqueResourceTypes.length) {
    return false;
  }
  return true;
};

// Course Resource is created at the same time as the Course Module
const createCourseModule = async (courseResourceBody) => {
  const { courseModule, courseResources } = courseResourceBody;
  const featuredCourse = await db.courses.findByPk(courseModule.courseId);

  if (!featuredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'COURSE_NOT_FOUND');
  }

  if (await titleExists(courseModule.title)) {
    throw new ApiError(httpStatus.ALREADY_REPORTED, 'COURSE_MODULE_TITLE_ALREADY_EXISTS');
  }

  if (!isResourceTypesUnique(courseResources))
    throw new ApiError(httpStatus.BAD_REQUEST, 'COURSE_RESOURCE_TYPES_MUST_BE_UNIQUE');

  const sequelizeTransaction = await db.sequelize.transaction();
  try {
    const createdCourseModule = await db.course_modules.create(courseModule, { transaction: sequelizeTransaction });
    const createdCourseResources = await db.course_resources.bulkCreate(
      courseResources.map((courseResource) => {
        if (courseResource.type === resourceTypes.VIDEO) {
          if (!courseResource.thumbnail) {
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
  const courseModule = await db.course_modules.findByPk(id, {
    include: { model: db.course_resources, attributes: { exclude: ['createdAt', 'updatedAt'] } },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  });
  return courseModule;
};

/**
 * Update user by id
 * @param {ObjectId} courseResourceId
 * @param {Object} updateBody
 * @returns {Promise<CourseModule>}
 */
const updateCourseModuleById = async (courseModuleId, updateBody) => {
  const existingCourseModule = await getCourseModuleById(courseModuleId);
  if (!existingCourseModule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'COURSE_MODULE_NOT_FOUND');
  }
  const { courseModule, courseResources } = updateBody;
  if (!courseResources && !isResourceTypesUnique(courseResources)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'COURSE_RESOURCE_TYPES_MUST_BE_UNIQUE');
  }

  if (courseModule && (await titleExists(courseModule.title)) && courseModule.title !== existingCourseModule.title) {
    throw new ApiError(httpStatus.ALREADY_REPORTED, 'COURSE_MODULE_WITH_TITLE_ALREADY_EXISTS');
  }
  const sequelizeTransaction = await db.sequelize.transaction();
  try {
    await db.course_modules.update(courseModule, { where: { id: courseModuleId } }, { transaction: sequelizeTransaction });

    let updatePromises;
    const filteredResources = [];
    if (courseResources !== undefined) {
      const existingCourseResources = await db.course_resources.findAll({ where: { courseModuleId } });

      // Validate the course resources
      courseResources.forEach((courseResource) => {
        const resource = existingCourseResources.find((existingResource) => existingResource.id === courseResource.id);
        if (!resource) {
          // eslint-disable-next-line no-throw-literal
          throw 'ONE_OR_MORE_COURSE_RESOURCES_NOT_FOUND';
        }
        const changedKeys = Object.keys(resource.dataValues).filter((key) => {
          return resource[key] !== courseResource[key] && courseResource[key] !== undefined;
        });

        const changedKeysAndValues = changedKeys.reduce((acc, key) => {
          // Perform validation on the changed keys
          if (key === 'type') {
            if (courseResource.type === resourceTypes.VIDEO) {
              if (!courseResource.thumbnail) {
                // eslint-disable-next-line no-throw-literal
                throw 'VIDEO_RESOURCES_REQUIRE_THUMBNAIL';
              }
            }
          }
          acc[key] = courseResource[key];
          return acc;
        }, {});
        // Remove unchanged resources
        if (Object.keys(changedKeysAndValues).length > 0)
          filteredResources.push({ ...changedKeysAndValues, id: courseResource.id });
      });

      // Update only the resources that have changed
      updatePromises = filteredResources.map((filteredResource) =>
        db.course_resources.update(
          filteredResource,
          { where: { id: filteredResource.id } },
          { transaction: sequelizeTransaction }
        )
      );
    }
    return Promise.all(updatePromises).then(async () => {
      await sequelizeTransaction.commit();
      return { message: 'Course module updated successfully', status: 200 };
    });
  } catch (error) {
    logger.error(error);
    await sequelizeTransaction.rollback();
    if (
      error === 'VIDEO_RESOURCES_REQUIRE_THUMBNAIL' ||
      error === 'COURSE_MODULE_TITLE_ALREADY_EXISTS' ||
      error === 'ONE_OR_MORE_COURSE_RESOURCES_NOT_FOUND'
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, error);
    }
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error updating course module');
  }
};

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
  updateCourseModuleById,
  deleteCourseModuleById,
};
