const _ = require('lodash');
const mathResolverClient = require('../clients/mathResolverClient');
const exercisesDB = require('../databases/exercisesDb');
const usersService = require('../services/usersService');
const logger = require('../utils/logger.js');

/**
 * Create exercise.
 *
 */
const create = async ({
  context, guideId, courseId, exerciseMetadata
}) => {
  await mathResolverClient.evaluate({
    context,
    problemInput: exerciseMetadata.problemInput,
    type: exerciseMetadata.type
  });

  // adding "d()/dx" or "\int dx" to the problem input
  let { problemInput } = exerciseMetadata;
  if (exerciseMetadata.type === 'derivative') {
    problemInput = `\\frac{d(${exerciseMetadata.problemInput})}{dx}`;
  } else if (exerciseMetadata.type === 'integral') {
    problemInput = `\\int ${exerciseMetadata.problemInput} dx`;
  }

  // adding exercise template
  const createdExercise = await exercisesDB.createExercise({
    context,
    guideId,
    courseId,
    exerciseMetadata: { ...exerciseMetadata, problemInput }
  });

  // adding exercise to existing users
  const { course } = context;
  const userIds = course.users.map((user) => user.userId);
  await usersService.addingExercisesToUsers({
    context,
    guideId,
    courseId,
    userIds,
    exerciseIds: [createdExercise.exerciseId]
  });

  // return user exercise
  const exerciseToBeRetrieved = await usersService.getExercise({
    context,
    guideId,
    courseId,
    exerciseId: createdExercise.exerciseId,
    userId: context.user.userId
  });

  // generate math tree (Note that this action will be async)
  generateMathTree({
    context,
    guideId,
    courseId,
    exerciseId: createdExercise.exerciseId,
    problemInput,
    type: exerciseMetadata.type
  });

  return exerciseToBeRetrieved;
};

/**
 * Copy course exercises.
 *
 */
const copyCourseExercises = async ({ context, sourceCourseId, targetCourseId }) => {
  const sourceExercises = await exercisesDB.listCourseExercises({
    context, courseId: sourceCourseId
  });

  const columns = ['guideId', 'problemInput', 'name', 'description', 'initialHint', 'type', 'difficulty', 'pipelineStatus'];
  const targetExercises = sourceExercises.map((exercise) => ({
    ..._.pick(exercise, columns),
    courseId: targetCourseId
  }));
  await exercisesDB.insertExercises({ exercises: targetExercises });

  // adding exercises to the creator
  const { course } = context;
  const userIds = course.users.map((user) => user.userId);
  const targetUserExercises = await usersService.addingCourseExercisesToUsers({
    context,
    courseId: targetCourseId,
    userIds
  });

  return targetUserExercises;
};

const generateMathTree = async ({
  context, guideId, courseId, exerciseId, problemInput, type
}) => {
  let metadataToUpdate;
  try {
    const mathTree = await mathResolverClient.generateMathTree({ context, problemInput, type });
    metadataToUpdate = { mathTree: JSON.stringify(mathTree), pipelineStatus: 'generated' };
  } catch (err) {
    logger.onLog(`Error while generating math tree: ${courseId}, ${guideId}, ${exerciseId}`);

    metadataToUpdate = { pipelineStatus: 'failed' };
  }

  return exercisesDB.updateExercise({
    courseId,
    guideId,
    exerciseId,
    exerciseMetadata: metadataToUpdate
  });
};

/**
 * Get exercise status.
 *
 */
const getExerciseStatus = async ({ context, guideId, courseId, exerciseId }) => {
  const exercise = await exercisesDB.getExercise({ context, guideId, courseId, exerciseId });

  return { pipelineStatus: exercise.pipelineStatus };
};

/**
 * List exercises.
 *
 */
const list = async ({
  context,
  guideId,
  courseId
}) => (
  exercisesDB.listExercises({
    context,
    guideId,
    courseId
  })
);

/**
 * Update exercise.
 *
 */
const update = async ({
  context,
  guideId,
  courseId,
  exerciseId,
  exerciseMetadata
}) => {
  // update the exercise template
  const updatedExercise = await exercisesDB.updateExercise({
    context,
    guideId,
    courseId,
    exerciseId,
    exerciseMetadata
  });

  if (exerciseMetadata.problemInput || exerciseMetadata.type) {
    // restore the exercise resolutions of the users
    await usersService.restoreExercise({ context, courseId, guideId, exerciseId });
  }

  return updatedExercise;
};

/**
 * Remove exercise.
 *
 */
const remove = async ({
  context,
  guideId,
  courseId,
  exerciseId
}) => (
  exercisesDB.removeExercise({
    context,
    guideId,
    courseId,
    exerciseId
  })
);


module.exports = {
  create,
  copyCourseExercises,
  getExerciseStatus,
  list,
  remove,
  update
};
