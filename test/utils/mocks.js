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
  times = 1
}) => {
  const validatePath = configs.services.mathResolverService.paths.validate;

  nock(mathResolverServiceUrl)
    .post(validatePath, { problemInput, type })
    .times(times)
    .reply(status, {});
};

const mockResolveExercise = ({
  status = 200,
  type,
  problemInput,
  stepList,
  currentExpression,
  times = 1,
  response = { exerciseStatus: 'valid' }
}) => {
  const validatePath = configs.services.mathResolverService.paths.resolve;

  nock(mathResolverServiceUrl)
    .post(validatePath, { problemInput, type, stepList, currentExpression })
    .times(times)
    .reply(status, response);
};

module.exports = {
  mockAuth,
  mockGetCourse,
  mockResolveExercise,
  mockValidateExercise
};
