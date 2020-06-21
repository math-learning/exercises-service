const { assert } = require('chai');
const requests = require('./utils/requests');
const mocks = require('./utils/mocks');
const { cleanDb, sanitizeResponse } = require('./utils/db');

describe('Integration course copy tests', () => {
  let token;
  let courseId;
  let courseIdToBeCopy;
  let guideId;
  let secondGuideId;
  let course;
  let mathTree;
  let professorProfile;

  let derivativeExerciseId;
  let derivativeExercise;
  let integrateExercise;
  let integrateExerciseToCreate;
  let derivativeExerciseToCreate;

  before(() => {
    courseId = 'course-id';
    courseIdToBeCopy = 'copy-course-id';
    guideId = 'guideId';
    secondGuideId = 'secondGuideId';
    token = 'token';
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
      pipelineStatus: 'generated',
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
      guideId: secondGuideId,
      pipelineStatus: 'generated',
      problemInput: `\\int ${integrateExerciseToCreate.problemInput} dx`
    };
    mathTree = { tree: 'input' };

    return cleanDb();
  });

  after(() => cleanDb());

  describe('Creating derivative exercise (by the professor)', () => {
    let createExerciseResponse;
    let expectedExercise;

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
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });
      mocks.mockValidateExercise(derivativeExerciseToCreate);
      mocks.mockGenerateMathTree({ response: mathTree });

      createExerciseResponse = await requests.createExercise({
        exercise: derivativeExerciseToCreate, courseId, guideId, token
      });
      derivativeExerciseId = createExerciseResponse.body.exerciseId;

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

  describe('Creating integrate exercise in other guide (by the professor)', () => {
    let createExerciseResponse;
    let expectedExercise;

    before(async () => {
      expectedExercise = {
        ...integrateExercise,
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
      mocks.mockGenerateMathTree({ response: mathTree });
      mocks.mockValidateExercise(integrateExerciseToCreate);

      createExerciseResponse = await requests.createExercise({
        exercise: integrateExerciseToCreate, courseId, guideId: secondGuideId, token
      });

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

  describe('Listing created exercises for first guide (by the professor)', () => {
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

  describe('Listing created exercises for second guide (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [integrateExercise];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      listedExercises = await requests.listExercises({ courseId, guideId: secondGuideId, token });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('body has the created exercise', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedExercises);
    });
  });

  describe('Updating the derivative user exercise (by the professor)', () => {
    let response;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      response = await requests.updateUserExercise({
        exerciseMetadata: { calification: 5 },
        exerciseId: derivativeExerciseId,
        courseId,
        guideId,
        userId: professorProfile.userId,
        token
      });
    });

    it('status is OK', () => assert.equal(response.status, 200));
  });

  describe('Copying the course to another (by the professor)', () => {
    let listedExercises;

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId, course });

      listedExercises = await requests.copyCourseExercises({
        sourceCourseId: courseId, targetCourseId: courseIdToBeCopy, token
      });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 204));
  });

  describe('Listing exercises for the copied first guide (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [{
        ...derivativeExercise,
        courseId: courseIdToBeCopy
      }];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId: courseIdToBeCopy, course });

      listedExercises = await requests.listExercises({
        courseId: courseIdToBeCopy, guideId, token
      });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('body has the created exercise', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedExercises);
    });
  });

  describe('Listing exercises for the copied second guide (by the professor)', () => {
    let listedExercises;
    let expectedExercises;

    before(() => {
      expectedExercises = [{
        ...integrateExercise,
        courseId: courseIdToBeCopy
      }];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId: courseIdToBeCopy, course });

      listedExercises = await requests.listExercises({
        courseId: courseIdToBeCopy, guideId: secondGuideId, token
      });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('body has the created exercise', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedExercises);
    });
  });

  describe('Asking (professor) user exercises for the copied first guide (should be restarted)', () => {
    let listedExercises;
    let expectedUserExercises;

    before(async () => {
      expectedUserExercises = [{
        ...derivativeExercise,
        courseId: courseIdToBeCopy,
        userId: professorProfile.userId,
        state: 'incompleted',
        calification: null
      }];
    });

    before(async () => {
      mocks.mockAuth({ profile: professorProfile });
      mocks.mockGetCourse({ courseId: courseIdToBeCopy, course });

      listedExercises = await requests.listUserExercises({
        courseId: courseIdToBeCopy, guideId, token
      });
    });

    it('status is OK', () => assert.equal(listedExercises.status, 200));

    it('should retrieve the exercises', () => {
      // eslint-disable-next-line no-param-reassign
      listedExercises.body.forEach((ex) => delete ex.exerciseId);
      assert.deepEqual(sanitizeResponse(listedExercises.body), expectedUserExercises);
    });
  });
});
