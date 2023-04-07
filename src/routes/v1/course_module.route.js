const express = require('express');
// const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const courseModuleValidation = require('../../validations/course_module.validation');
const courseModuleController = require('../../controllers/course_module.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(courseModuleValidation.createCourseModule), courseModuleController.createCourseModule)
  .get(validate(courseModuleValidation.getCourseModules), courseModuleController.getCourseModules);

router.route('/brief/').get(validate(courseModuleValidation.getCourseModule), courseModuleController.getCourseModuleBrief);
router
  .route('/brief/:courseModuleId')
  .get(validate(courseModuleValidation.getCourseModule), courseModuleController.getCourseModuleBrief);

router
  .route('/:courseModuleId')
  .get(validate(courseModuleValidation.getCourseModule), courseModuleController.getCourseModule)
  .patch(validate(courseModuleValidation.updateCourseModule), courseModuleController.updateCourseModule)
  .delete(validate(courseModuleValidation.deleteCourseModule), courseModuleController.deleteCourseModule);

module.exports = router;
