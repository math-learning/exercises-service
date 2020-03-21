const { processDbResponse, snakelize } = require('../utils/dbUtils');
const configs = require('../config')();
const knex = require('knex')(configs.db); // eslint-disable-line

/**
 * Create entry for exercise and user.
 *
 */
const createErrorCountEntry = async ({ userId, guideId, courseId, exerciseId }) => (
  knex('exercise_error_count')
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
  knex('exercise_error_count')
    .update({ count })
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
  knex('exercise_error_count')
    .sum('count as count')
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
    .select('eec.exercise_id', 'eec.guide_id', 'eec.course_id', 'ex.name')
    .sum('eec.count as count')
    .from('exercise_error_count as eec')
    .innerJoin('exercises as ex', function innerJoinFn() {
      this.on('eec.exercise_id', 'ex.exercise_id');
      this.on('eec.guide_id', 'ex.guide_id');
      this.on('eec.course_id', 'ex.course_id');
    })
    .where('eec.course_id', courseId)
    .groupBy('eec.exercise_id', 'eec.guide_id', 'eec.course_id', 'ex.name', 'ex.created_at')
    .orderBy('ex.created_at')
    .then(processDbResponse)
);

module.exports = {
  createErrorCountEntry,
  getExerciseErrorCount,
  getExercisesErrorCount,
  increaseErrorCount
};
