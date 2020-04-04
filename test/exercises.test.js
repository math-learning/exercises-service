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
  let professorProfile;

  let derivativeEx;
  let integrateEx;
  let integrateExerciseId;

  before(() => {
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
    derivativeEx = {
      problemInput: 'dx',
      name: 'derivada',
      description: 'calcula la derivada',
      type: 'derivative',
      difficulty: 'easy'
    };
    integrateEx = {
      problemInput: 'int',
      name: 'integrala',
      description: 'calcula la integrate',
      type: 'integral',
      difficulty: 'easy'
    };

    return cleanDb();
  });

  after(() => cleanDb());

  describe('Creating derivative exercise (by the professor)', () => {
    let createExerciseResponse;
    let expectedExercise;

    before(async () => {
      expectedExercise = {
        ...derivativeEx,
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
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockValidateExercise({
        courseId, guideId, ...derivativeEx
      });
      mocks.mockGenerateMathTree({ status: 404 });

      createExerciseResponse = await requests.createExercise({
        exercise: derivativeEx, courseId, guideId, token
      });
    });

    it('status is OK', () => assert.equal(createExerciseResponse.status, 201));

    it('body has the created exercise', () => {
      assert.property(createExerciseResponse.body, 'exerciseId');
      delete createExerciseResponse.body.exerciseId;
      assert.deepEqual(sanitizeResponse(createExerciseResponse.body), expectedExercise);
    });
  });

  describe('Error: Creating an invalid exercise (with wrong exercise type)', () => {
    let errorResponse;
    let exercise;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      exercise = {
        ...derivativeEx,
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
    it('message describe.skips the error', () => assert.equal(errorResponse.body.message, 'problemInput, name, type or difficulty have not been provided'));
  });

  describe('Error: when the course does not exist', () => {
    let errorResponse;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course, status: 404 });

      errorResponse = await requests.createExercise({
        exercise: derivativeEx, courseId, guideId, token
      });
    });

    it('status is OK', () => assert.equal(errorResponse.status, 404));
  });

  describe('Listing created exercises (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [
        { ...derivativeEx, courseId, guideId, pipelineStatus: 'waiting' }
      ];
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
        ...integrateEx,
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
        courseId, guideId, ...integrateEx
      });
      mocks.mockGenerateMathTree({ status: 404 });

      createExerciseResponse = await requests.createExercise({
        exercise: integrateEx, courseId, guideId, token
      });
      integrateExerciseId = createExerciseResponse.body.exerciseId;
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
        ...integrateEx,
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
        ...integrateEx,
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
    it('message describe.skips the error', () => assert.equal(errorResponse.body.message, 'Exercise not found'));
  });

  describe('Listing updated exercises (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [
        {
          ...derivativeEx, courseId, guideId, pipelineStatus: 'waiting'
        },
        {
          ...integrateEx, courseId, guideId, name: newName, pipelineStatus: 'waiting'
        }
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
      expectedExercises = [
        {
          ...derivativeEx, courseId, guideId, pipelineStatus: 'waiting'
        }
      ];
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
