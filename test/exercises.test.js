const { assert } = require('chai');
const requests = require('./utils/requests');
const mocks = require('./utils/mocks');
const { cleanDb, sanitizeResponse } = require('./utils/db');

describe('Integration exercises tests', () => {
  let token;
  let newName;
  let courseId;
  let guideId;
  let course;
  let mathTreeTimeout;
  let professorProfile;

  let derivativeExercise;
  let integrateExercise;
  let integrateExerciseId;
  let integrateExerciseToCreate;
  let derivativeExerciseToCreate;

  before(() => {
    mathTreeTimeout = 200;
    courseId = 'course-id';
    guideId = 'guideId';
    token = 'token';
    newName = 'new name';
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
      users: [professorProfile]
    };
    derivativeExerciseToCreate = {
      problemInput: 'x',
      name: 'derivada',
      description: 'calcula la derivada',
      type: 'derivative',
      difficulty: 'easy',
      initialHint: 'try using some theoreme',
    };
    derivativeExercise = {
      ...derivativeExerciseToCreate,
      courseId,
      guideId,
      pipelineStatus: 'failed',
      problemInput: `\\frac{d(${derivativeExerciseToCreate.problemInput})}{dx}`
    };
    integrateExerciseToCreate = {
      problemInput: '2x',
      name: 'integrala',
      description: 'calcula la integrate',
      type: 'integral',
      difficulty: 'easy',
      initialHint: null,
    };
    integrateExercise = {
      ...integrateExerciseToCreate,
      courseId,
      guideId,
      pipelineStatus: 'failed',
      problemInput: `\\int ${integrateExerciseToCreate.problemInput} dx`
    };

    // to simulate proccessing time
    mocks.mockGenerateMathTree({ status: 404, timeout: mathTreeTimeout });

    return cleanDb();
  });

  after(() => cleanDb()); // TODO: clean nocks after

  describe('Creating derivative exercise (by the professor)', () => {
    let createExerciseResponse;
    let expectedExercise;
    let prePipelineStatus;
    let postPipelineStatus;

    before(async () => {
      expectedExercise = {
        ...derivativeExercise,
        guideId,
        courseId,
        state: 'incompleted',
        pipelineStatus: 'waiting',
        calification: null,
        stepList: [],
        userId: professorProfile.userId,
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile, times: 3 });
      mocks.mockGetCourse({ courseId, course, times: 3 });
      mocks.mockValidateExercise({
        courseId, guideId, ...derivativeExerciseToCreate
      });

      createExerciseResponse = await requests.createExercise({
        exercise: derivativeExerciseToCreate, courseId, guideId, token
      });

      prePipelineStatus = await requests.getPipelineStatus({
        courseId, guideId, exerciseId: createExerciseResponse.body.exerciseId, token
      });

      // To wait the math tree is generated and the exercise is marked as generated
      await new Promise((resolve) => setTimeout(resolve, mathTreeTimeout + 100));

      postPipelineStatus = await requests.getPipelineStatus({
        courseId, guideId, exerciseId: createExerciseResponse.body.exerciseId, token
      });
    });

    it('status is OK', () => assert.equal(createExerciseResponse.status, 201));

    it('body has the created exercise', () => {
      assert.property(createExerciseResponse.body, 'exerciseId');
      delete createExerciseResponse.body.exerciseId;
      assert.deepEqual(sanitizeResponse(createExerciseResponse.body), expectedExercise);
    });

    it('pre pipeline status should be waiting', () => {
      assert.equal(prePipelineStatus.body.pipelineStatus, 'waiting');
    });

    it('post pipeline status should be generated', () => {
      assert.equal(postPipelineStatus.body.pipelineStatus, 'failed');
    });
  });

  describe('Error: Creating an invalid exercise (with wrong exercise type)', () => {
    let errorResponse;
    let exercise;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      exercise = {
        ...derivativeExercise,
        type: 'falopa'
      };

      errorResponse = await requests.createExercise({
        exercise, courseId, guideId, token
      });
    });

    it('status is bad request', () => assert.equal(errorResponse.status, 400));
    it('message describe.skips the error', () => assert.equal(errorResponse.body.message, 'Invalid exercise type'));
  });

  describe('Error: Creating an invalid exercise (not sending all the properties)', () => {
    let errorResponse;
    let exercise;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      exercise = {
        problemInput: 'dx',
        description: 'calcula la derivada',
        type: 'derivative',
        difficulty: 'easy'
      };

      errorResponse = await requests.createExercise({
        exercise, courseId, guideId, token
      });
    });

    it('status is bad request', () => assert.equal(errorResponse.status, 400));
    it('message describes the error', () => assert.equal(errorResponse.body.message, 'problemInput, name, type or difficulty have not been provided'));
  });

  describe('Error: when the course does not exist', () => {
    let errorResponse;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course, status: 404 });

      errorResponse = await requests.createExercise({
        exercise: derivativeExercise, courseId, guideId, token
      });
    });

    it('status is OK', () => assert.equal(errorResponse.status, 404));
  });

  describe('Listing created exercises (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [derivativeExercise];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      listedExercises = await requests.listExercises({ courseId, guideId, token });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('body has the created exercise', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedExercises);
    });
  });

  describe('Creating integrate exercise (by the professor)', () => {
    let createExerciseResponse;
    let expectedExercise;

    before(async () => {
      expectedExercise = {
        ...integrateExercise,
        guideId,
        courseId,
        state: 'incompleted',
        pipelineStatus: 'waiting',
        calification: null,
        stepList: [],
        userId: professorProfile.userId
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockValidateExercise({
        courseId, guideId, ...integrateExerciseToCreate
      });

      createExerciseResponse = await requests.createExercise({
        exercise: integrateExerciseToCreate, courseId, guideId, token
      });

      integrateExerciseId = createExerciseResponse.body.exerciseId;
      // To wait the math tree is generated and the exercise is marked as generated
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    it('status is OK', () => assert.equal(createExerciseResponse.status, 201));

    it('body has the created exercise', () => {
      assert.property(createExerciseResponse.body, 'exerciseId');
      delete createExerciseResponse.body.exerciseId;
      assert.deepEqual(sanitizeResponse(createExerciseResponse.body), expectedExercise);
    });
  });

  describe('Updating exercise (by the professor)', () => {
    let updateExerciseResponse;
    let updatedExercise;

    before(async () => {
      updatedExercise = {
        ...integrateExercise,
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
        exerciseId: integrateExerciseId,
        token
      });
    });

    it('status is OK', () => assert.equal(updateExerciseResponse.status, 201));
  });

  describe('Error: Updating a non existing exercise', () => {
    let updatedExercise;
    let errorResponse;

    before(async () => {
      updatedExercise = {
        ...integrateExercise,
        name: newName
      };
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      errorResponse = await requests.updateExercise({
        exercise: updatedExercise,
        courseId,
        guideId,
        exerciseId: 'fafafa',
        token
      });
    });

    it('status is OK', () => assert.equal(errorResponse.status, 404));
    it('message describes the error', () => assert.equal(errorResponse.body.message, 'Exercise not found'));
  });

  describe('Listing updated exercises (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [
        derivativeExercise,
        { ...integrateExercise, name: newName }
      ];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      listedExercises = await requests.listExercises({ courseId, guideId, token });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('body has the updated exercise', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedExercises);
    });
  });

  describe('Deleting exercise (by the professor)', () => {
    let deletedExResponse;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      deletedExResponse = await requests.removeExercise({
        courseId,
        guideId,
        exerciseId: integrateExerciseId,
        token
      });
    });

    it('status is OK', () => assert.equal(deletedExResponse.status, 204));
  });

  describe('Deleting the same exercise again (a non existing exercise)', () => {
    let deletedExResponse;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      deletedExResponse = await requests.removeExercise({
        courseId,
        guideId,
        exerciseId: integrateExerciseId,
        token
      });
    });

    it('status is OK', () => assert.equal(deletedExResponse.status, 204));
  });

  describe('Listing exercises should not retrive the deleted (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [derivativeExercise];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      listedExercises = await requests.listExercises({ courseId, guideId, token });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('body has the created exercise', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedExercises);
    });
  });
});
