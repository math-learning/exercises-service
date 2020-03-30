const _ = require('lodash');
const createError = require('http-errors');
const expressify = require('expressify')();
const usersService = require('../services/usersService');

const extractMetadata = (body) => (
  _.pick(body, ['calification'])
);

const validateMetadata = (metadata) => {
  const { calification } = metadata;
  if (!typeof calification === 'number' || calification < 0 || calification > 10) {
    throw createError.BadRequest('Invalid exercise calification');
  }
};

/**
 * Add course exercises to user.
 *
 */
const addUser = async (req, res) => {
  const {
    courseId
  } = req.params;

  const { userId } = req.body;

  if (!userId) {
    return Promise.reject(createError.BadRequest('userId should be provided'));
  }

  await usersService.addUser({
    context: req.context,
    courseId,
    userId
  });

  return res.status(201)
    .send({});
};

/**
 * List user exercises.
 *
 */
const listExercises = async (req, res) => {
  const {
    courseId,
    guideId
  } = req.params;

  const { user } = req.context;

  const exercises = await usersService.listExercises({
    context: req.context,
    guideId,
    courseId,
    userId: user.userId
  });

  return res.status(200).json(exercises);
};

/**
 * Get user exercise.
 *
 */
const getExercise = async (req, res) => {
  const {
    courseId,
    guideId,
    exerciseId
  } = req.params;

  const exercise = await usersService.getExercise({
    context: req.context,
    guideId,
    courseId,
    exerciseId
  });
  return res.status(200).json(exercise);
};

const updateExercise = async (req, res) => {
  const {
    userId
  } = req.query;
  const {
    courseId,
    guideId,
    exerciseId
  } = req.params;

  const exerciseMetadata = extractMetadata(req.body);
  validateMetadata(exerciseMetadata);

  const updatedExercise = await usersService.updateExercise({
    context: req.context,
    userId,
    guideId,
    courseId,
    exerciseId,
    exerciseMetadata
  });
  return res.status(200)
    .json(updatedExercise);
};

/**
 * Get only "delivered" user exercises
 *
 */
const listDeliveredExercises = async (req, res) => {
  const {
    courseId,
    guideId,
    userId
  } = req.params;

  const exercises = await usersService.listExercises({
    context: req.context,
    guideId,
    courseId,
    userId,
    state: 'delivered'
  });

  return res.status(200).json(exercises);
};

module.exports = expressify({
  addUser,
  getExercise,
  listExercises,
  listDeliveredExercises,
  updateExercise
});
