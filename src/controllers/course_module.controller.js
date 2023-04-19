const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { courseModuleService } = require('../services');

const createCourseModule = catchAsync(async (req, res) => {
  const courseModule = await courseModuleService.createCourseModule(req.body);
  res.status(httpStatus.CREATED).send({ data: courseModule, status: 200 });
});

const getCourseModules = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await courseModuleService.queryCourseModules(filter, options);
  res.send(result);
});

const getCourseModulesBrief = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await courseModuleService.queryCourseModules(filter, options, req, true);
  res.send(result);
});

const getCourseModule = catchAsync(async (req, res) => {
  const courseModule = await courseModuleService.getCourseModuleById(req.params.courseModuleId);
  if (!courseModule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course Module not found');
  }
  res.send(courseModule);
});

const getCourseModuleBrief = catchAsync(async (req, res) => {
  const courseModule = await courseModuleService.getCourseModuleById(req.params.courseModuleId, true);
  if (!courseModule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course Module not found');
  }
  res.send(courseModule);
});

const updateCourseModule = catchAsync(async (req, res) => {
  const courseModule = await courseModuleService.updateCourseModuleById(req.params.courseModuleId, req.body);
  res.send(courseModule);
});

const deleteCourseModule = catchAsync(async (req, res) => {
  await courseModuleService.deleteCourseModuleById(req.params.courseModuleId);
  res.status(httpStatus.OK).send({ data: null, status: 200 });
});

module.exports = {
  createCourseModule,
  getCourseModules,
  getCourseModulesBrief,
  getCourseModule,
  getCourseModuleBrief,
  updateCourseModule,
  deleteCourseModule,
};
