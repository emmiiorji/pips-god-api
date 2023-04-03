const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const transactionRoute = require('./transaction.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const notificationRoute = require('./notification.route');
const courseModuleRoute = require('./course_module.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/transactions',
    route: transactionRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/course_modules',
    route: courseModuleRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
