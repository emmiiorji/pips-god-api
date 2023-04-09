const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const courseModuleValidation = require('../../validations/course_module.validation');
const courseModuleController = require('../../controllers/course_module.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('course_modules.manage'),
    validate(courseModuleValidation.createCourseModule),
    courseModuleController.createCourseModule
  )
  .get(
    auth('course_modules.manage'),
    validate(courseModuleValidation.getCourseModules),
    courseModuleController.getCourseModules
  );

router
  .route('/brief')
  .get(auth(), validate(courseModuleValidation.getCourseModules), courseModuleController.getCourseModulesBrief);
router
  .route('/brief/:courseModuleId')
  .get(auth(), validate(courseModuleValidation.getCourseModule), courseModuleController.getCourseModuleBrief);

router
  .route('/:courseModuleId')
  .get(
    auth('course_modules.manage'),
    validate(courseModuleValidation.getCourseModule),
    courseModuleController.getCourseModule
  )
  .patch(
    auth('course_modules.manage'),
    validate(courseModuleValidation.updateCourseModule),
    courseModuleController.updateCourseModule
  )
  .delete(
    auth('course_modules.manage'),
    validate(courseModuleValidation.deleteCourseModule),
    courseModuleController.deleteCourseModule
  );

module.exports = router;
