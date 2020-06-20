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
  let newName;
  let exerciseName;
  let newProblemInput;
  let mathTree;
  let studentProfile;
  let professorProfile;

  let derivativeExerciseId;
  let derivativeExercise;
  let derivativeExerciseToCreate;

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
    firstExpression = { expression: '2x', variables: [] };
    secondExpression = { expression: '2', variables: [] };
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
    derivativeExerciseToCreate = {
      problemInput: 'x',
      name: exerciseName,
      description: 'calcula la derivada',
      type: 'derivative',
      difficulty: 'easy',
      initialHint: null
    };
    derivativeExercise = {
      ...derivativeExerciseToCreate,
      courseId,
      guideId,
      pipelineStatus: 'generated',
      problemInput: `\\frac{d(${derivativeExerciseToCreate.problemInput})}{dx}`
    };
    mathTree = { tree: 'input' };
  });

  before(() => cleanDb());
  after(() => cleanDb());

  describe('Evaluate exercise before creating', () => {
    let expectedResponse;

    before(async () => {
      const exercise = {
        problemInput: 'x',
        type: 'derivative'
      };
      expectedResponse = { result: 'result' };

      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockValidateExercise({ courseId, guideId, ...exercise, response: expectedResponse });

      response = await requests.evaluateExercise({
        exercise, courseId, guideId, token
      });
    });

    it('exercise added correctly', () => assert.equal(response.status, 200));
    it('exercise added correctly', () => assert.deepEqual(response.body, expectedResponse));
  });

  describe('Adding an exercise to course', () => {
    let derivResponse;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockValidateExercise({ courseId, guideId, ...derivativeExerciseToCreate });
      mocks.mockGenerateMathTree({ response: mathTree });

      derivResponse = await requests.createExercise({
        exercise: derivativeExerciseToCreate, courseId, guideId, token
      });
      derivativeExerciseId = derivResponse.body.exerciseId;

      // To wait the math tree is generated and the exercise is marked as generated
      await new Promise((resolve) => setTimeout(resolve, 200));
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
        mathTree,
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
          exerciseId: derivativeExerciseId,
          name: exerciseName,
          users: [{
            userId: studentProfile.userId,
            count: 1
          }]
        }]
      }]);
    });
  });

  describe('Getting steps count statistics (should be empty since no exercise has been delivered)', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getExerciseStepsCountStatistics({ courseId, token });
    });

    it('the statistics has been updated', () => {
      assert.deepEqual(response.body, []);
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
        mathTree,
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
          exerciseId: derivativeExerciseId,
          name: exerciseName,
          users: [{
            userId: studentProfile.userId,
            count: 2
          }]
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
        mathTree,
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
        pipelineStatus: 'generated',
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
        mathTree,
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
        pipelineStatus: 'generated',
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
        pipelineStatus: 'generated',
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
        pipelineStatus: 'generated',
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
        problemInput: newProblemInput // TODO: fix this bug, because the input should not change
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
        pipelineStatus: 'generated',
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

  describe('Asking all the student exercises (by the proffesor) (before delivering it)', () => {
    let expectedUserExercises;

    before(async () => {
      expectedUserExercises = [];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.listSpecificUserExercises({
        courseId,
        guideId,
        userId: studentProfile.userId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve all the delivered exercises (none)', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercises);
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
        mathTree,
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

  describe('Asking the exercise (status delivered)', () => {
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
        state: 'delivered',
        pipelineStatus: 'generated',
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

  describe('Asking all the student exercises (by the proffesor)', () => {
    let expectedUserExercises;

    before(async () => {
      expectedUserExercises = [{
        ...derivativeExercise,
        userId,
        guideId,
        courseId,
        exerciseId: derivativeExerciseId,
        name: newName,
        problemInput: newProblemInput,
        state: 'delivered',
        pipelineStatus: 'generated',
        calification: null
      }];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.listSpecificUserExercises({
        courseId,
        guideId,
        userId: studentProfile.userId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the asked exercises', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercises);
    });
  });

  describe('Asking the student exercise (by the profesor)', () => {
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
        state: 'delivered',
        pipelineStatus: 'generated',
        calification: null,
        stepList: [firstExpression]
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getSpecificUserExercise({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        userId: studentProfile.userId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('should retrieve the asked exercise', () => {
      assert.deepEqual(sanitizeResponse(response.body), expectedUserExercise);
    });
  });

  describe('Getting steps count statistics (should be fulled since the exercise has been delivered)', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getExerciseStepsCountStatistics({ courseId, token });
    });

    it('the statistics has been updated', () => {
      assert.deepEqual(response.body, [{
        exercises: [{
          count: 1,
          exerciseId: derivativeExerciseId,
          name: newName,
          users: [{
            count: 1,
            userId: studentProfile.userId
          }]
        }],
        guideId
      }]);
    });
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

  describe('Resolving the exercise by the profesor (status resolved)', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockResolveExercise({
        type: derivativeExercise.type,
        problemInput: newProblemInput,
        stepList: [],
        mathTree,
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

  describe('Resolving the exercise by the profesor (status resolved) Adding another step', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockResolveExercise({
        type: derivativeExercise.type,
        problemInput: newProblemInput,
        stepList: [firstExpression],
        mathTree,
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

  describe('Delivering the exercise', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
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

  describe('Getting steps count statistics (should be empty since no exercise has been delivered)', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getExerciseStepsCountStatistics({ courseId, token });
    });

    it('the statistics has been updated', () => {
      assert.deepEqual(response.body, [{
        exercises: [{
          count: 3,
          exerciseId: derivativeExerciseId,
          name: newName,
          users: [{
            count: 2,
            userId: professorProfile.userId,
          }, {
            count: 1,
            userId: studentProfile.userId
          }]
        }],
        guideId
      }]);
    });
  });

  describe('Getting error statistics again', () => {
    before(async () => {
      mocks.mockAuth({ profile: studentProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.getExerciseStatistics({ courseId, token });
    });

    it('the statistics has been updated (only adding the proffesor)', () => {
      assert.deepEqual(response.body, [{
        guideId,
        exercises: [{
          count: 2,
          exerciseId: derivativeExerciseId,
          name: newName,
          users: [{
            count: 0,
            userId: professorProfile.userId,
          }, {
            count: 2,
            userId: studentProfile.userId
          }]
        }]
      }]);
    });
  });

  describe('Getting exercise resolutions', () => {
    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.listExerciseResolutions({
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));

    it('the statistics has been updated (only adding the proffesor)', () => {
      assert.deepEqual(response.body, [{
        userId: studentProfile.userId,
        stepList: [firstExpression]
      }, {
        userId: professorProfile.userId,
        stepList: [firstExpression, secondExpression]
      }]);
    });
  });
});
