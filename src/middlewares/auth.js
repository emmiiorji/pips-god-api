const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { rolesAndRights } = require('../config/constants');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  req.roles = user.roles.map((role) => role.name);

  // Force user to verify email of they are not an admin or superadmin
  if (!req.roles.includes('user') && !user.isEmailVerified) {
    return reject(new ApiError(httpStatus.FORBIDDEN, 'Please verify your email'));
  }

  if (requiredRights.length) {
    const { roleRights } = await rolesAndRights();
    req.body.userRoles = [];
    const userRights = user.roles.reduce((acc, role) => {
      acc.push(...roleRights.get(role.name));
      req.userRoles.push(role.name);
      return acc;
    }, []);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
