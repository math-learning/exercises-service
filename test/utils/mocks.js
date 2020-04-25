const nock = require('nock');
const url = require('url');
const fs = require('fs');
const path = require('path');
const configs = require('../../configs/test');

const usersServiceUrl = url.format(configs.services.usersService.url);
const coursesServiceUrl = url.format(configs.services.coursesService.url);
const mathResolverServiceUrl = url.format(configs.services.mathResolverService.url);

const mockAuth = ({ status = 200, profile = {}, times = 1 }) => {
  nock(usersServiceUrl)
    .get('/login')
    .times(times)
    .reply(status, profile);
};

const mockGetCourse = ({
  status = 200,
  courseId,
  course = {},
  times = 1
}) => {
  const coursePath = configs.services.coursesService.paths.course({ courseId });

  nock(coursesServiceUrl)
    .get(coursePath)
    .times(times)
    .reply(status, course);
};

const mockValidateExercise = ({
  status = 200,
  problemInput,
  type,
  times = 1,
  response = {}
}) => {
  const validatePath = configs.services.mathResolverService.paths.evaluate;

  nock(mathResolverServiceUrl)
    .post(validatePath, { problem_input: problemInput, type })
    .times(times)
    .reply(status, response);
};

const mockResolveExercise = ({
  status = 200,
  type,
  problemInput,
  stepList,
  mathTree = {},
  currentExpression,
  times = 1,
  response = { exerciseStatus: 'valid' }
}) => {
  const theorems = getTheorems({ type });
  const validatePath = configs.services.mathResolverService.paths.resolve;

  nock(mathResolverServiceUrl)
    .post(validatePath, {
      type,
      theorems,
      math_tree: mathTree,
      problem_input: problemInput,
      step_list: JSON.stringify(stepList),
      current_expression: currentExpression
    })
    .times(times)
    .reply(status, response);
};

const mockGenerateMathTree = ({
  status = 200,
  // type,
  // problemInput,
  times = 1,
  response = { tree: 'input' }
}) => {
  const validatePath = configs.services.mathResolverService.paths.mathTree;

  nock(mathResolverServiceUrl)
    .post(validatePath)
    .times(times)
    .reply(status, response);
};

const getTheorems = ({ type }) => {
  let theorems = [];
  if (type === 'derivative') {
    theorems = fs.readFileSync(path.resolve(__dirname, '../../src/clients/derivative-theorems.json'));
  } else if (type === 'integral') {
    theorems = fs.readFileSync(path.resolve(__dirname, '../../src/clients/integral-theorems.json'));
  }

  return JSON.parse(theorems);
};


module.exports = {
  mockAuth,
  mockGetCourse,
  mockGenerateMathTree,
  mockResolveExercise,
  mockValidateExercise
};
