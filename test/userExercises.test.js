const { assert } = require('chai');
const requests = require('./utils/requests');
const mocks = require('./utils/mocks');
const { cleanDb, sanitizeResponse } = require('./utils/db');

describe('Integration user exercises tests', () => {
  let token;
  let userId;
  let courseId;
  let guideId;
  let course;
  let studentProfile;
  let professorProfile;

  let derivativeExerciseId;
  let integrateExerciseId;
  let derivativeExercise;
  let integrateExercise;

  let response;

  before(() => {
    courseId = 'course-id';
    guideId = 'guideId';
    userId = 'student';
    token = 'token';
    course = {
      name: 'curso',
      description: 'description',
      courseId
    };
    studentProfile = {
      userId: 'student',
      name: 'pedro',
      email: 'pedro@gmail',
      rol: 'student'
    };
    professorProfile = {
      userId: 'professor',
      name: 'licha',
      email: 'licha@gmail',
      rol: 'professor'
    };
  });

  before(() => cleanDb());
  after(() => cleanDb());

  describe('Adding exercises to course (int + deriv)', () => {
    let derivResponse;
    let integResponse;

    before(async () => {
      mocks.mockAuth({ times: 2, profile: professorProfile });
      mocks.mockGetCourse({
        courseId,
        guideId,
        course,
        times: 2
      });

      derivativeExercise = {
        exercise: 'dx',
        name: 'derivada',
        description: 'calcula la derivada',
        type: 'derivative',
        difficulty: 'easy'
      };
      integrateExercise = {
        exercise: 'dx',
        name: 'integrate',
        description: 'calcula la integral',
        type: 'integral',
        difficulty: 'easy'
      };
      derivResponse = await requests.createExercise({
        exercise: derivativeExercise, courseId, guideId, token
      });
      integResponse = await requests.createExercise({
        exercise: integrateExercise, courseId, guideId, token
      });
      derivativeExerciseId = derivResponse.body.exerciseId;
      integrateExerciseId = integResponse.body.exerciseId;
    });

    it('exercise added correctly', () => assert.equal(derivResponse.status, 201));
    it('exercise added correctly', () => assert.equal(integResponse.status, 201));
  });

  describe('Error: Adding a non provided user', () => {
    let errorResponse;

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      errorResponse = await requests.addUser({ courseId, user: {}, token });
    });

    it('status is OK', () => assert.equal(errorResponse.status, 400));
  });

  describe('Error: When the course does not exist', () => {
    let errorResponse;

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course, status: 404 });

      errorResponse = await requests.addUser({ courseId, user: {}, token });
    });

    it('status is OK', () => assert.equal(errorResponse.status, 404));
  });

  describe('Adding user exercises', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.addUser({ courseId, user: { userId }, token });
    });

    it('status is OK', () => assert.equal(response.status, 201));
  });

  describe('Asking user exercises', () => {
    let expectedUserExercises;

    before(async () => {
      expectedUserExercises = [{
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        state: 'incompleted',
        calification: null
      }, {
        ...integrateExercise,
        userId,
        guideId,
        courseId,
        exerciseId: integrateExerciseId,
        state: 'incompleted',
        calification: null
      }];
    });

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.listUserExercises({ courseId, guideId, token });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the created exercises', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercises);
    });
  });

  describe('Asking the derivative user exercise', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        state: 'incompleted',
        calification: null
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.getUserExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the asked exercise', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercise);
    });
  });

  describe('Error: Asking a non existing user exercise', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.getUserExercise({
        exerciseId: 'falopa',
        courseId,
        guideId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 404));

    it('should retrieve the properly message', () => {
      assert.deepEqual(response.body.message, 'Exercise not found');
    });
  });

  describe('Updating the derivative user exercise (by the professor)', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.updateUserExercise({
        exerciseMetadata: { calification: 10 },
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        userId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));
  });

  describe('Asking the derivative user exercise (again)', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        state: 'incompleted',
        calification: 10
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.getUserExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the updated exercise', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercise);
    });
  });

  describe('Deleting the derivative exercise (by the professor)', () => {
    let deletedExResponse;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      deletedExResponse = await requests.removeExercise({
        courseId,
        guideId,
        exerciseId: derivativeExerciseId,
        token
      });
    });

    it('status is OK', () => assert.equal(deletedExResponse.status, 204));
  });

  describe('Asking user exercises (should have removed the deriv exercise)', () => {
    let expectedUserExercises;

    before(async () => {
      expectedUserExercises = [{
        ...integrateExercise,
        userId,
        guideId,
        courseId,
        exerciseId: integrateExerciseId,
        state: 'incompleted',
        calification: null
      }];
    });

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.listUserExercises({ courseId, guideId, token });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the exercises (but not the derivative one)', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercises);
    });
  });

  describe('Error: Asking the derivative user exercise', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.getUserExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is not found', () => assert.equal(response.status, 404));
  });
});
