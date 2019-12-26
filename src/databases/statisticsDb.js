const { processDbResponse, snakelize } = require('../utils/dbUtils');
const configs = require('../config')();
const knex = require('knex')(configs.db); // eslint-disable-line

/**
 * Create entry for exercise and user.
 *
 */
const createErrorCountEntry = async ({ exerciseId, userId }) => (
  knex('exercise_error_count')
    .insert(snakelize({
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
const increaseErrorCount = async ({ exerciseId, userId, count = 1 }) => (
  knex('exercise_error_count')
    .update({ count })
    .where('exercise_id', exerciseId)
    .where('user_id', userId)
);

/**
 * Get error count of exercise
 *
 */
const getExerciseErrorCount = async (params) => (
  knex('exercise_error_count')
    .sum('count')
    .where(snakelize(params))
    .then(processDbResponse)
    .then((response) => response[0])
);

module.exports = {
  createErrorCountEntry,
  getExerciseErrorCount,
  increaseErrorCount
};
