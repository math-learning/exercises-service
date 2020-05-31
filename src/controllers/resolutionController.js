const createError = require('http-errors');
const expressify = require('expressify')();
const resolutionService = require('../services/resolutionService');

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
  const { currentExpression } = req.body;

  const exerciseStatus = await resolutionService.resolve({
    context: req.context,
    guideId,
    courseId,
    exerciseId,
    currentExpression
  });

  return res.status(200).json(exerciseStatus);
};

/**
 * Deliver the exercise.
 *
 */
const deliver = async (req, res) => {
  const {
    courseId,
    guideId,
    exerciseId
  } = req.params;

  await resolutionService.deliver({
    context: req.context,
    guideId,
    courseId,
    exerciseId
  });

  return res.status(200).json({});
};

/**
 * Evaluate exercise
 *
 */
const evaluate = async (req, res) => {
  const { problemInput, type } = req.body;

  const resolution = await resolutionService.evaluate({ context: req.context, problemInput, type });

  return res.status(200).json(resolution);
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
  askHelp,
  deliver,
  evaluate,
  removeStep,
  resolve
});
