const _ = require('lodash');
const createError = require('http-errors');
const expressify = require('expressify')();
const resolutionService = require('../services/resolutionService');

const extractExercise = (body) => (
  _.pick(body, ['currentExpression'])
);

const validateBody = (body) => {
  if (!body.currentExpression) {
    throw createError.BadRequest('Missing params');
  }
};

/**
 * Resolve the exercise.
 *
 */
const resolve = async (req, res) => {
  const {
    courseId,
    guideId,
    exerciseId
  } = req.params;

  validateBody(req.body);
  const exercise = extractExercise(req.body);

  const exerciseStatus = await resolutionService.resolve({
    context: req.context,
    guideId,
    courseId,
    exerciseId,
    exercise
  });

  return res.status(200).json(exerciseStatus);
};

/**
 * Remove step from exercise.
 *
 */
const removeStep = async (req, res) => {
  const {
    courseId,
    guideId,
    exerciseId
  } = req.params;

  await resolutionService.removeStep({
    context: req.context, guideId, courseId, exerciseId
  });

  return res.status(204).json({});
};

/**
 * Ask help for an exercise.
 *
 */
const askHelp = async (req, res) => {
  const {
    courseId,
    guideId,
    exerciseId
  } = req.params;

  const help = await resolutionService.askHelp({
    context: req.context, guideId, courseId, exerciseId
  });

  return res.status(200).json(help);
};


module.exports = expressify({
  removeStep,
  resolve,
  askHelp
});
