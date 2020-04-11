const mathResolverClient = require('../clients/mathResolverClient');
const exercisesDB = require('../databases/exercisesDb');
const usersService = require('../services/usersService');

/**
 * Create exercise.
 *
 */
const create = async ({
  context, guideId, courseId, exerciseMetadata
}) => {
  await mathResolverClient.evaluate({
    context,
    problemInput: exerciseMetadata.problemInput,
    type: exerciseMetadata.type
  });

  // adding exercise template
  const createdExercise = await exercisesDB.createExercise({
    context,
    guideId,
    courseId,
    exerciseMetadata
  });

  // adding exercise to existing professors
  const { course } = context;
  const professorIds = course.professors.map((professor) => professor.userId);
  await usersService.addingExercisesToUsers({
    context,
    guideId,
    courseId,
    userIds: professorIds,
    exerciseIds: [createdExercise.exerciseId]
  });

  // return user exercise
  const exerciseToBeRetrieved = await usersService.getExercise({
    context,
    guideId,
    courseId,
    exerciseId: createdExercise.exerciseId,
    userId: context.user.userId
  });

  // generate math tree (Note that this action will be async)
  generateMathTree({
    context,
    guideId,
    courseId,
    exerciseId: createdExercise.exerciseId,
    problemInput: exerciseMetadata.problemInput,
    type: exerciseMetadata.type
  });

  return exerciseToBeRetrieved;
};

const generateMathTree = async ({
  context, guideId, courseId, exerciseId, problemInput, type
}) => {
  const mathTree = await mathResolverClient.generateMathTree({ context, problemInput, type });

  return exercisesDB.updateExercise({
    courseId,
    guideId,
    exerciseId,
    exerciseMetadata: { mathTree: JSON.stringify(mathTree), pipelineStatus: 'generated' }
  });
};

/**
 * List exercises.
 *
 */
const list = async ({
  context,
  guideId,
  courseId
}) => (
  exercisesDB.listExercises({
    context,
    guideId,
    courseId
  })
);

/**
 * Update exercise.
 *
 */
const update = async ({
  context,
  guideId,
  courseId,
  exerciseId,
  exerciseMetadata
}) => {
  // update the exercise template
  const updatedExercise = await exercisesDB.updateExercise({
    context,
    guideId,
    courseId,
    exerciseId,
    exerciseMetadata
  });

  if (exerciseMetadata.problemInput || exerciseMetadata.type) {
    // restore the exercise resolutions of the users
    await usersService.restoreExercise({ context, courseId, guideId, exerciseId });
  }

  return updatedExercise;
};

/**
 * Remove exercise.
 *
 */
const remove = async ({
  context,
  guideId,
  courseId,
  exerciseId
}) => (
  exercisesDB.removeExercise({
    context,
    guideId,
    courseId,
    exerciseId
  })
);


module.exports = {
  create,
  list,
  remove,
  update
};
