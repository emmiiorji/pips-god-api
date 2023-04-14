const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { db } = require('../models');

const hasModuleAccess = async (req, res, next) => {
  if (!req.roles.includes(req.query.role)) {
    next(new ApiError(httpStatus.FORBIDDEN, `NOT_${req.query.role.toUpperCase()}`));
  }
  const userCourseModules = await db.user_course_modules.findOne({
    where: { userId: req.user.id, courseModuleId: req.params.courseModuleId, isStarted: true },
    include: [
      {
        model: db.course_modules,
        include: [{ model: db.course_resources, include: [{ model: db.courses }] }],
      },
    ],
  });
  if (!userCourseModules) {
    next(new ApiError(httpStatus.FORBIDDEN, 'NOT_STARTED'));
  }

  // TODO: Create a middleware to run check if user subscription is active
  const userSubscriptions = await db.subscriptions.findAll({
    where: {
      userId: req.user.id,
      subscriptionPlanId: userCourseModules.course_module.course_resources[0].course.subscriptionPlanId,
      isValid: true,
    },
  });
  if (!userSubscriptions.length) {
    next(new ApiError(httpStatus.FORBIDDEN, 'NOT_SUBSCRIBED'));
  }

  next();
};

module.exports = hasModuleAccess;
