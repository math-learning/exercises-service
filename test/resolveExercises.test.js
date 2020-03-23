const { assert } = require('chai');
const requests = require('./utils/requests');
const mocks = require('./utils/mocks');
const { cleanDb, sanitizeResponse } = require('./utils/db');

describe.only('Integration resolve exercises tests', () => {
  let token;
  let userId;
  let courseId;
  let guideId;
  let course;
  let newName;
  let exerciseName;
  let newProblemInput;
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
    newName = 'new name';
    exerciseName = 'derivada';
    newProblemInput = '2x + 1';
    firstExpression = '2x';
    secondExpression = '2';
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
    course = {
      name: 'curso',
      description: 'description',
      courseId,
      professors: [professorProfile],
      users: [professorProfile, studentProfile]
    };
  });

  before(() => cleanDb());
  after(() => cleanDb());

  describe('Adding an exercise to course', () => {
    let derivResponse;

    before(async () => {
      derivativeExercise = {
        problemInput: 'dx',
        name: exerciseName,
        description: 'calcula la derivada',
        type: 'derivative',
        difficulty: 'easy'
      };

      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
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
      mocks.mockGetCourse({ courseId, course });
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

  describe('Getting error statistics', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getExerciseStatistics({ courseId, token });
    });

    it('the statistics has been updated', () => {
      assert.deepEqual(response.body, [{
        guideId,
        exercises: [{
          count: 1,
          courseId,
          guideId,
          exerciseId: derivativeExerciseId,
          name: exerciseName
        }]
      }]);
    });
  });

  describe('Resolving the exercise (status invalid again)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });
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

  describe('Getting error statistics again', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getExerciseStatistics({ courseId, token });
    });

    it('the statistics has been updated (increase the error count)', () => {
      assert.deepEqual(response.body, [{
        guideId,
        exercises: [{
          count: 2,
          courseId,
          guideId,
          exerciseId: derivativeExerciseId,
          name: exerciseName
        }]
      }]);
    });
  });

  describe('Resolving the exercise (status valid)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });
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
      mocks.mockGetCourse({ courseId, course });

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
      mocks.mockGetCourse({ courseId, course });
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
      mocks.mockGetCourse({ courseId, course });

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
      mocks.mockGetCourse({ courseId, course });

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
      mocks.mockGetCourse({ courseId, course });

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

  describe('Updating name (by the professor) (should not reset the resolutions)', () => {
    let updateExerciseResponse;
    let updatedExercise;

    before(async () => {
      updatedExercise = {
        name: newName
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      updateExerciseResponse = await requests.updateExercise({
        exercise: updatedExercise,
        courseId,
        guideId,
        exerciseId: derivativeExerciseId,
        token
      });
    });

    it('status is OK', () => assert.equal(updateExerciseResponse.status, 201));
  });

  describe('Asking the exercise (should not has been restored)', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        name: newName,
        state: 'incompleted',
        calification: null,
        stepList: [firstExpression]
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

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

  describe('Updating problemInput (by the professor) (should reset the resolutions)', () => {
    let updateExerciseResponse;
    let updatedExercise;

    before(async () => {
      updatedExercise = {
        problemInput: newProblemInput
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      updateExerciseResponse = await requests.updateExercise({
        exercise: updatedExercise,
        courseId,
        guideId,
        exerciseId: derivativeExerciseId,
        token
      });
    });

    it('status is OK', () => assert.equal(updateExerciseResponse.status, 201));
  });

  describe('Asking the exercise (should has been restored)', () => {
    let expectedUserExercise;

    before(async () => {
      expectedUserExercise = {
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        name: newName,
        problemInput: newProblemInput,
        state: 'incompleted',
        calification: null,
        stepList: []
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

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

  describe('Delivering the exercise (when the status is not resolved) should fail', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.deliverExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is 409', () => assert.equal(response.status, 409));
  });

  describe('Resolving the exercise again (status resolved)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockResolveExercise({
        type: derivativeExercise.type,
        problemInput: newProblemInput,
        stepList: [],
        currentExpression: firstExpression,
        response: { exerciseStatus: 'resolved' }
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
      assert.deepEqual(response.body, { exerciseStatus: 'resolved' });
    });
  });

  describe('Delivering the exercise', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.deliverExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));
  });

  describe('Trying to delete a step after deliver (should fail)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.deleteExerciseStep({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is 409', () => assert.equal(response.status, 409));
  });

  describe('Trying to resolve the exercise after deliver (should fail)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.resolveExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token,
        currentExpression: firstExpression
      });
    });

    it('status is 409', () => assert.equal(response.status, 409));
  });
});
