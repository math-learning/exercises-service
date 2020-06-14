const nock = require('nock');
const url = require('url');
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
    .post(validatePath, {
      problem_input: {
        expression: problemInput,
        variables: []
      },
      type
    })
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
  const validatePath = configs.services.mathResolverService.paths.resolve;

  nock(mathResolverServiceUrl)
    .post(validatePath, {
      type,
      math_tree: mathTree,
      problem_input: {
        expression: problemInput,
        variables: []
      },
      step_list: stepList,
      current_expression: currentExpression
    })
    .times(times)
    .reply(status, response);
};

const mockGenerateMathTree = ({
  status = 200,
  // type,
  // problemInput,
  timeout = 0,
  times = 1,
  response = { tree: 'input' }
}) => {
  const validatePath = configs.services.mathResolverService.paths.mathTree;

  nock(mathResolverServiceUrl)
    .post(validatePath)
    .times(times)
    .reply((uri, requestBody, cb) => {
      setTimeout(() => cb(null, [status, response]), timeout);
    });
};

module.exports = {
  mockAuth,
  mockGetCourse,
  mockGenerateMathTree,
  mockResolveExercise,
  mockValidateExercise
};
