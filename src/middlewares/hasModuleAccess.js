const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const hasModuleAccess = async (req, res, next) => {
  if (!req.roles.includes(req.body.role)) {
    next(new ApiError(httpStatus.FORBIDDEN, 'FORBIDDEN'));
  }
  next();
};

module.exports = hasModuleAccess;
