const createError = require('http-errors');
const mathResolverClient = require('../clients/mathResolverClient');
const exercisesDB = require('../databases/exercisesDb');

/**
 * Create exercise.
 *
 */
const create = async ({
  context, guideId, courseId, exerciseMetadata
}) => {
  try {
    await mathResolverClient.validate({
      context,
      problemInput: exerciseMetadata.problemInput,
      type: exerciseMetadata.type
    });
  } catch (e) {
    if (e.status === 400) {
      throw createError(400, { message: 'invalid exercise' });
    }
    throw e;
  }

  return exercisesDB.createExercise({
    context,
    guideId,
    courseId,
    exerciseMetadata
  });
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
}) => (
  exercisesDB.updateExercise({
    context,
    guideId,
    courseId,
    exerciseId,
    exerciseMetadata
  })
);

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
  list,
  remove,
  update
};
