const { processDbResponse, snakelize } = require('../utils/dbUtils');
const configs = require('../config')();
const knex = require('knex')(configs.db); // eslint-disable-line

/**
 * Create entry for exercise and user.
 *
 */
const createExerciseCountEntry = async ({ userId, guideId, courseId, exerciseId }) => (
  knex('exercise_errors_count')
    .insert(snakelize({
      courseId,
      guideId,
      exerciseId,
      userId
    }))
    .returning('*')
    .then(processDbResponse)
    .then((response) => response[0])
);

/**
 * Increate error count of exercise
 *
 */
const increaseErrorCount = async ({ userId, guideId, courseId, exerciseId, count = 1 }) => (
  knex('exercise_errors_count')
    .update({ error_count: count })
    .where('course_id', courseId)
    .where('guide_id', guideId)
    .where('exercise_id', exerciseId)
    .where('user_id', userId)
);

/**
 * Get error count of exercise
 *
 */
const getExerciseErrorCount = async (params) => (
  knex('exercise_errors_count')
    .select(knex.raw('sum(error_count)::integer as count'))
    .where(snakelize(params))
    .then(processDbResponse)
    .then((response) => response[0])
);

/**
 * Get error count of exercise
 *
 */
const getExercisesErrorCount = async ({ courseId }) => (
  knex.queryBuilder()
    .select(knex.raw('eec.exercise_id, eec.guide_id, eec.course_id, eec.user_id, ex.name, sum(error_count)::integer as count'))
    .from('exercise_errors_count as eec')
    .innerJoin('exercises as ex', function innerJoinFn() {
      this.on('eec.exercise_id', 'ex.exercise_id');
      this.on('eec.guide_id', 'ex.guide_id');
      this.on('eec.course_id', 'ex.course_id');
    })
    .where('eec.course_id', courseId)
    .groupBy('eec.exercise_id', 'eec.guide_id', 'eec.course_id', 'eec.user_id', 'ex.name', 'ex.created_at')
    .orderBy('ex.created_at')
    .then(processDbResponse)
);

/**
 * Insert total step count of exercise
 *
 */
const createTotalStepsCountEntry = async ({
  userId, guideId, courseId, exerciseId, stepsCount
}) => (
  knex('exercise_steps_count')
    .insert(snakelize({
      courseId,
      guideId,
      exerciseId,
      userId,
      stepsCount
    }))
    .returning('*')
    .then(processDbResponse)
    .then((response) => response[0])
);

/**
 * Get exercise step count entry
 *
 */
const getExerciseStepCountEntry = async (params) => (
  knex('exercise_steps_count')
    .select('*')
    .where(snakelize(params))
    .then(processDbResponse)
    .then((response) => response[0])
);

/**
 * Get total step count of exercises
 *
 */
const getExercisesTotalStepCount = async ({ courseId }) => (
  knex.queryBuilder()
    .select(knex.raw('eec.exercise_id, eec.guide_id, eec.course_id, eec.user_id, ex.name, sum(steps_count)::integer as count'))
    .from('exercise_steps_count as eec')
    .innerJoin('exercises as ex', function innerJoinFn() {
      this.on('eec.exercise_id', 'ex.exercise_id');
      this.on('eec.guide_id', 'ex.guide_id');
      this.on('eec.course_id', 'ex.course_id');
    })
    .where('eec.course_id', courseId)
    .groupBy('eec.exercise_id', 'eec.guide_id', 'eec.course_id', 'eec.user_id', 'ex.name', 'ex.created_at')
    .orderBy('ex.created_at')
    .then(processDbResponse)
);

module.exports = {
  createExerciseCountEntry,
  getExerciseStepCountEntry,
  getExerciseErrorCount,
  getExercisesErrorCount,
  getExercisesTotalStepCount,
  increaseErrorCount,
  createTotalStepsCountEntry
};
