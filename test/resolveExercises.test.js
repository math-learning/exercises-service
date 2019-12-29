const { assert } = require('chai');
const requests = require('./utils/requests');
const mocks = require('./utils/mocks');
const { cleanDb, sanitizeResponse } = require('./utils/db');

describe('Integration resolve exercises tests', () => {
  let token;
  let userId;
  let courseId;
  let guideId;
  let course;
  let studentProfile;
  let professorProfile;

  let derivativeExerciseId;
  let derivativeExercise;

  let firstExpression;
  let secondExpression;

  let response;

  before(() => {
    courseId = 'course-id';
    guideId = 'guideId';
    userId = 'student';
    token = 'token';
    firstExpression = '2x';
    secondExpression = '2';
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

  describe('Adding an exercise to course', () => {
    let derivResponse;

    before(async () => {
      derivativeExercise = {
        problemInput: 'dx',
        name: 'derivada',
        description: 'calcula la derivada',
        type: 'derivative',
        difficulty: 'easy'
      };

      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, guideId, course });
      mocks.mockValidateExercise({ courseId, guideId, ...derivativeExercise });

      derivResponse = await requests.createExercise({
        exercise: derivativeExercise, courseId, guideId, token
      });
      derivativeExerciseId = derivResponse.body.exerciseId;
    });

    it('exercise added correctly', () => assert.equal(derivResponse.status, 201));
  });

  describe('Adding user exercises', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.addUser({ courseId, user: { userId }, token });
    });

    it('status is OK', () => assert.equal(response.status, 201));
  });

  describe('Resolving the exercise (status invalid)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });
      mocks.mockResolveExercise({
        type: derivativeExercise.type,
        problemInput: derivativeExercise.problemInput,
        stepList: [],
        currentExpression: firstExpression,
        response: { exerciseStatus: 'invalid' }
      });

      response = await requests.resolveExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token,
        currentExpression: firstExpression
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the current status', () => {
      assert.deepEqual(response.body, { exerciseStatus: 'invalid' });
    });
  });

  describe('Resolving the exercise (status valid)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });
      mocks.mockResolveExercise({
        type: derivativeExercise.type,
        problemInput: derivativeExercise.problemInput,
        stepList: [],
        currentExpression: firstExpression,
        response: { exerciseStatus: 'valid' }
      });

      response = await requests.resolveExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token,
        currentExpression: firstExpression
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the current status', () => {
      assert.deepEqual(response.body, { exerciseStatus: 'valid' });
    });
  });

  describe('Asking the exercise (should have a new step)', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        state: 'incompleted',
        calification: null,
        stepList: [firstExpression]
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

    it('should retrieve the asked exercise (with the new step)', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercise);
    });
  });

  describe('Resolving the exercise (status resolved)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });
      mocks.mockResolveExercise({
        type: derivativeExercise.type,
        problemInput: derivativeExercise.problemInput,
        stepList: [firstExpression],
        currentExpression: secondExpression,
        response: { exerciseStatus: 'resolved' }
      });

      response = await requests.resolveExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token,
        currentExpression: secondExpression
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the current status', () => {
      assert.deepEqual(response.body, { exerciseStatus: 'resolved' });
    });
  });

  describe('Asking the exercise (should have been resolved with a new step)', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        state: 'resolved',
        calification: null,
        stepList: [firstExpression, secondExpression]
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

    it('should retrieve the asked exercise (with the new step and status resolved)', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercise);
    });
  });

  describe('Removing a step from the exercise', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, guideId, course });

      response = await requests.deleteExerciseStep({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is 204', () => assert.equal(response.status, 204));
  });

  describe('Asking the exercise (should not have the last step)', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        state: 'incompleted',
        calification: null,
        stepList: [firstExpression]
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

    it('should retrieve the asked exercise (without the last step)', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercise);
    });
  });
});
