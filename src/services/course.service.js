const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');
const logger = require('../config/logger');
// const logger = require('../config/logger');

const getCourseModulesOfCourse = async (courseId) => {
  const courseResources = await db.course_resources.findAll({
    where: { courseId },
  });
  const courseModuleIds = courseResources.map((courseResource) => courseResource.courseModuleId);

  return courseModuleIds;
};

const enrollUserInCourse = async (courseId, userId, transaction, start = true) => {
  const course = await db.courses.findByPk(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'COURSE_NOT_FOUND');
  }

  const user = await db.users.findByPk(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'USER_NOT_FOUND');
  }

  const existingUserCourse = await db.user_courses.findOne({
    where: { userId, courseId },
  });
  if (existingUserCourse) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'USER_ALREADY_ENROLLED_IN_COURSE');
  }

  const currentDate = new Date().toISOString();
  await db.user_courses.create(
    { userId, courseId, isStarted: start, startedAt: start ? currentDate : null },
    { transaction }
  );

  // Get all course modules of course and sort by id. The ID determines the order the modules are taken
  const courseModuleIds = await getCourseModulesOfCourse(courseId);
  // firstModuleId will be undefined if courseModuleIds is empty
  const [firstModuleId, ...restCourseModuleIds] = courseModuleIds.sort((a, b) => a - b);

  // Enroll user in all courses and mark first course as started
  const restUserCourseModules = restCourseModuleIds.map((courseModuleId) => ({
    userId,
    courseModuleId,
  }));
  const allUserCourseModules = !firstModuleId
    ? restCourseModuleIds
    : [
        ...restUserCourseModules,
        {
          userId,
          courseModuleId: firstModuleId,
          isStarted: true,
          startedAt: currentDate,
        },
      ];
  await db.user_course_modules.bulkCreate(allUserCourseModules, { transaction });
  if (!firstModuleId) logger.info(`No course modules found for course ${course.name}!`);

  return true;
};

module.exports = {
  enrollUserInCourse,
  getCourseModulesOfCourse,
};
