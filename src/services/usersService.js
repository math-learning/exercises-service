const exercisesDB = require('../databases/exercisesDb');
const userExercisesDB = require('../databases/userExercisesDb');

/**
 * Add course exercises to user.
 *
 */
const addUser = async ({
  context,
  courseId,
  userId
}) => {
  const currentUserExercises = await userExercisesDB.listExercises({
    context,
    courseId,
    userId
  });

  if (currentUserExercises.length) {
    return currentUserExercises;
  }
  const courseExercises = await exercisesDB.listExercises({
    context,
    courseId
  });
  const userExercises = courseExercises.map((exercise) => ({
    courseId: exercise.courseId,
    guideId: exercise.guideId,
    exerciseId: exercise.exerciseId,
    stepList: JSON.stringify([]),
    userId
  }));

  return userExercisesDB.insertExercises({
    context,
    userExercises
  });
};

/**
 * Adding exercises to user ids.
 *
 */
const addingExercisesToUsers = async ({
  context,
  courseId,
  guideId,
  exerciseIds,
  userIds
}) => {
  const exercises = await exercisesDB.listExercisesByIds({
    context,
    courseId,
    guideId,
    exerciseIds
  });

  const userExercises = userIds.reduce((acum, userId) => {
    const exercisesToInsert = exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      courseId: exercise.courseId,
      guideId: exercise.guideId,
      stepList: JSON.stringify([]),
      userId
    }));

    return [
      ...acum,
      ...exercisesToInsert
    ];
  }, []);

  return userExercisesDB.insertExercises({
    context,
    userExercises
  });
};

/**
 * Adding course exercises to user ids.
 *
 */
const addingCourseExercisesToUsers = async ({
  context,
  courseId,
  userIds
}) => {
  const exercises = await exercisesDB.listCourseExercises({ context, courseId });

  const userExercises = userIds.reduce((acum, userId) => {
    const exercisesToInsert = exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      courseId: exercise.courseId,
      guideId: exercise.guideId,
      stepList: JSON.stringify([]),
      userId
    }));

    return [
      ...acum,
      ...exercisesToInsert
    ];
  }, []);

  return userExercisesDB.insertExercises({
    context,
    userExercises
  });
};

/**
 * List user exercises.
 *
 */
const listExercises = async ({
  context,
  guideId,
  courseId,
  userId,
  metadata
}) => (
  userExercisesDB.listExercises({
    context,
    userId,
    guideId,
    courseId,
    metadata
  })
);

/**
 * List other resolutions.
 *
 */
const listResolutions = async ({
  context, guideId, courseId, exerciseId, userId,
}) => {
  const resolutions = await userExercisesDB.listResolutions({
    context, userId, guideId, courseId, exerciseId
  });

  return resolutions.map((resolution) => ({
    ...resolution,
    stepList: JSON.parse(resolution.stepList)
  }));
};

/**
 * Get user exercise.
 *
 */
const getExercise = async ({
  context,
  guideId,
  courseId,
  exerciseId,
  userId
}) => {
  const exercise = await userExercisesDB.getExercise({
    context, userId, guideId, courseId, exerciseId
  });

  exercise.stepList = JSON.parse(exercise.stepList);

  return exercise;
};

/**
 * Restore exercise for each user
 *
 */
const restoreExercise = async ({
  context,
  guideId,
  courseId,
  exerciseId
}) => (
  userExercisesDB.restoreExercise({
    context,
    guideId,
    courseId,
    exerciseId
  })
);

/**
 * Update user exercise
 *
 */
const updateExercise = async ({
  context,
  userId,
  guideId,
  courseId,
  exerciseId,
  exerciseMetadata
}) => (
  userExercisesDB.updateExercise({
    context,
    userId,
    guideId,
    courseId,
    exerciseId,
    exerciseMetadata
  })
);

module.exports = {
  addUser,
  addingCourseExercisesToUsers,
  addingExercisesToUsers,
  getExercise,
  listExercises,
  listResolutions,
  restoreExercise,
  updateExercise
};
