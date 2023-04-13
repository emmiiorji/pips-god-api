const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// const { db } = require('../models');

const hasModuleAccess = async (req, res, next) => {
  if (!req.roles.includes(req.query.role)) {
    next(new ApiError(httpStatus.FORBIDDEN, 'FORBIDDEN'));
  }
  // const moduleUser = await db.users.findOne({
  //   where: { id: req.user.id },
  //   include: [
  //     {
  //       model: db.course_modules,
  //       through: {
  //         model: db.user_course_modules,
  //         where: { course_module_id: req.params.course_module_id },
  //       },
  //       required: true,
  //     },
  //   ],
  // });
  next();
};

module.exports = hasModuleAccess;
