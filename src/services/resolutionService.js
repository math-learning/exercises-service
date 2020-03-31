const createError = require('http-errors');
const mathResolverClient = require('../clients/mathResolverClient');
const usersService = require('../services/usersService');
const statisticsService = require('../services/statisticsService');

function validateExerciseHasNotBeenDelivered(currentExercise) {
  if (currentExercise.state === 'delivered') {
    throw createError.Conflict('Exercise has been already delivered');
  }
}

/**
 * Resolve exercise.
 *
 */
const resolve = async ({
  context,
  guideId,
  courseId,
  exerciseId,
  exercise
}) => {
  const { user: { userId } } = context;
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId, userId
  });

  validateExerciseHasNotBeenDelivered(currentExercise);

  const { problemInput, type, stepList } = currentExercise;
  const { currentExpression } = exercise;

  const resolveResult = await mathResolverClient.resolve({
    context, type, problemInput, stepList, currentExpression
  });

  let exerciseMetadata = {};
  if (resolveResult.exerciseStatus === 'invalid') {
    await statisticsService.addInvalidStep({ context, guideId, courseId, exerciseId, userId });
    exerciseMetadata = { state: 'incompleted' };

  } else if (resolveResult.exerciseStatus === 'valid') {
    const newStepList = JSON.stringify([...stepList, currentExpression]);
    exerciseMetadata = { stepList: newStepList, state: 'incompleted' };

  } else if (resolveResult.exerciseStatus === 'resolved') {
    const newStepList = JSON.stringify([...stepList, currentExpression]);
    exerciseMetadata = { stepList: newStepList, state: 'resolved' };
  }

  await usersService.updateExercise({
    context, userId, guideId, courseId, exerciseId, exerciseMetadata
  });

  return resolveResult;
};

/**
 * Removing one step from exercise
 *
 */
const removeStep = async ({
  context,
  guideId,
  courseId,
  exerciseId
}) => {
  const { user: { userId } } = context;
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId, userId
  });
  validateExerciseHasNotBeenDelivered(currentExercise);

  const { stepList } = currentExercise;

  if (stepList.length > 0) {
    const newStepList = JSON.stringify(stepList.slice(0, -1));
    const exerciseMetadata = { stepList: newStepList, state: 'incompleted' };

    await usersService.updateExercise({
      context, userId, guideId, courseId, exerciseId, exerciseMetadata
    });
  }
};

/**
 * Ask help for an exercise.
 *
 */
const askHelp = async ({
  context,
  guideId,
  courseId,
  exerciseId
}) => {
  const { user: { userId } } = context;
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId, userId
  });
  const { type } = currentExercise;
  const { stepList, problemInput } = currentExercise;

  return mathResolverClient.askHelp({ context, type, problemInput, stepList });
};

/**
 * Delivering exercise
 *
 */
const deliver = async ({
  context,
  guideId,
  courseId,
  exerciseId
}) => {
  const { user: { userId } } = context;
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId, userId
  });

  if (currentExercise.state === 'delivered') {
    return;
  }

  if (currentExercise.state !== 'resolved') {
    throw createError.Conflict('Exercise has not been resolved yet');
  }

  const exerciseMetadata = { state: 'delivered' };
  await usersService.updateExercise({
    context, userId, guideId, courseId, exerciseId, exerciseMetadata
  });
};


module.exports = {
  askHelp,
  deliver,
  removeStep,
  resolve
};
