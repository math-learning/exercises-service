const createError = require('http-errors');

const { processDbResponse, snakelize } = require('../utils/dbUtils');
const exercisesDb = require('./exercisesDb');
const configs = require('../config')();
const knex = require('knex')(configs.db); // eslint-disable-line

const DEFAULT_METADATA = {
  stepList: JSON.stringify([]),
  state: 'incompleted',
  calification: null
};

/**
 * Get user exercises.
 *
 */
const listExercises = async ({
  userId,
  guideId,
  courseId,
  metadata = {}
}) => (
  knex.queryBuilder()
    .select('state', 'user_id', 'calification')
    .from('student_exercises as se')
    .innerJoin('exercises as ex', function innerJoinFn() {
      this.on('se.exercise_id', 'ex.exercise_id');
      this.on('se.guide_id', 'ex.guide_id');
      this.on('se.course_id', 'ex.course_id');
    })
    .select(exercisesDb.commonColumns.map((column) => `ex.${column}`))
    .modify((queryBuilder) => {
      if (courseId) {
        queryBuilder.where('ex.course_id', courseId);
      }
      if (guideId) {
        queryBuilder.where('ex.guide_id', guideId);
      }
      if (metadata.state) {
        queryBuilder.where('se.state', metadata.state);
      }
    })
    .where('user_id', userId)
    .orderBy('ex.created_at')
    .orderBy('ex.name')
    .then(processDbResponse)
);

/**
 * Get user exercise.
 *
 */
const getExercise = async ({
  userId,
  guideId,
  courseId,
  exerciseId
}) => (
  knex('student_exercises')
    .select('student_exercises.*')
    .innerJoin('exercises', function innerJoin() {
      this.on('student_exercises.exercise_id', 'exercises.exercise_id');
      this.on('student_exercises.guide_id', 'exercises.guide_id');
      this.on('student_exercises.course_id', 'exercises.course_id');
    })
    .select(exercisesDb.commonColumns.map((column) => `exercises.${column}`))
    .modify((queryBuilder) => {
      if (courseId) {
        queryBuilder.where('student_exercises.course_id', courseId);
      }
      if (guideId) {
        queryBuilder.where('student_exercises.guide_id', guideId);
      }
    })
    .where('exercises.exercise_id', exerciseId)
    .where('user_id', userId)
    .orderBy('exercises.created_at')
    .then(processDbResponse)
    .then((response) => {
      if (!response[0]) {
        throw createError.NotFound('Exercise not found');
      }
      return response[0];
    })
);

/**
 * Get other resolutions.
 *
 */
const listResolutions = async ({
  guideId,
  courseId,
  exerciseId
}) => (
  knex.queryBuilder()
    .select('user_id', 'step_list')
    .from('student_exercises as se')
    .where('course_id', courseId)
    .where('guide_id', guideId)
    .where('exercise_id', exerciseId)
    .where('state', 'delivered')
    .orderBy('created_at')
    .then(processDbResponse)
);

/**
 * Insert user exercises in bulk.
 *
 */
const insertExercises = async ({ userExercises }) => (
  knex('student_exercises')
    .insert(userExercises.map(snakelize))
    .returning('*')
    .then(processDbResponse)
    .then((response) => response[0])
);

/**
 * Update user exercise
 *
 */
const updateExercise = async ({
  userId,
  courseId,
  guideId,
  exerciseId,
  exerciseMetadata
}) => (
  knex('student_exercises')
    .update(snakelize(exerciseMetadata))
    .where(snakelize({
      userId,
      courseId,
      guideId,
      exerciseId
    }))
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
 * Restore exercise resolution
 *
 */
const restoreExercise = async ({ courseId, guideId, exerciseId }) => (
  knex('student_exercises')
    .update(snakelize(DEFAULT_METADATA))
    .where(snakelize({ courseId, guideId, exerciseId }))
    .then(processDbResponse)
);

/**
 * Get users qualification
 *
 */
const getUsersQualifications = async ({ courseId }) => (
  knex.queryBuilder()
    .select(knex.raw('user_id, sum(calification)::integer as qualification, count(*)::integer as delivery_count'))
    .from('student_exercises')
    .where('course_id', courseId)
    .whereNotNull('calification')
    .groupBy('user_id')
    .orderBy('qualification', 'desc')
    .then(processDbResponse)
);


module.exports = {
  getExercise,
  getUsersQualifications,
  listResolutions,
  insertExercises,
  listExercises,
  restoreExercise,
  updateExercise
};
