const mathResolverClient = require('../clients/mathResolverClient');
const usersService = require('../services/usersService');
const statisticsService = require('../services/statisticsService');

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
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId
  });
  const { user: { userId } } = context;
  const { problemInput, type, stepList } = currentExercise;
  const { currentExpression } = exercise; // TODO: currentExpression is not necessary if we have the whole stepList

  const resolveResult = await mathResolverClient.resolve({
    context, type, problemInput, stepList, currentExpression
  });

  let exerciseMetadata = {};
  if (resolveResult.exerciseStatus === 'invalid') {
    await statisticsService.addInvalidStep({ context, userId, exerciseId });
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
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId
  });
  const { user: { userId } } = context;
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
  const currentExercise = await usersService.getExercise({
    context, guideId, courseId, exerciseId
  });
  const { type } = currentExercise;
  const { stepList, problemInput } = currentExercise;

  return mathResolverClient.askHelp({ context, type, problemInput, stepList });
};


module.exports = {
  askHelp,
  removeStep,
  resolve
};
