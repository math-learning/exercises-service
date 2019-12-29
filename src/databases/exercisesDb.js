const createError = require('http-errors');

const { processDbResponse, snakelize } = require('../utils/dbUtils');
const configs = require('../config')();
const knex = require('knex')(configs.db); // eslint-disable-line

/**
 * Create exercise.
 *
 */
const createExercise = async ({ courseId, guideId, exerciseMetadata }) => (
  knex('exercises')
    .insert(snakelize({
      ...exerciseMetadata,
      guideId,
      courseId
    }))
    .returning('*')
    .then(processDbResponse)
    .then((response) => response[0])
);

/**
 * List exercise.
 *
 */
const listExercises = async ({ courseId, guideId }) => {
  if (!courseId && !guideId) {
    throw new Error('at least courseId or guideId should be defined');
  }

  return knex('exercises')
    .select('*')
    .where(snakelize({
      courseId,
      guideId
    }))
    .orderBy('created_at')
    .then(processDbResponse);
};

/**
 * Update exercise.
 *
 */
const updateExercise = async ({
  courseId,
  guideId,
  exerciseId,
  exerciseMetadata
}) => (
  knex('exercises')
    .update(snakelize(exerciseMetadata))
    .where('course_id', courseId)
    .where('guide_id', guideId)
    .where('exercise_id', exerciseId)
    .returning('*')
    .then(processDbResponse)
    .then((response) => {
      if (!response[0]) {
        throw createError.NotFound('Exercise not found');
      }
      return response[0];
    })
);

/**
 * Remove exercise.
 *
 */
const removeExercise = async ({ courseId, guideId, exerciseId }) => {
  const trx = await knex.transaction();
  await trx.delete()
    .from('exercises')
    .where(snakelize({
      courseId,
      guideId,
      exerciseId
    }));

  await trx.delete()
    .from('student_exercises')
    .where(snakelize({ exerciseId }));

  await trx.commit();
};

module.exports = {
  createExercise,
  listExercises,
  removeExercise,
  updateExercise
};
