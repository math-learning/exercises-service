const statisticsDb = require('../databases/statisticsDb');

/**
 * Add invalid step statistic.
 *
 */
const addInvalidStep = async ({ userId, guideId, courseId, exerciseId }) => {
  const errorCount = await statisticsDb.getExerciseErrorCount({
    userId, guideId, courseId, exerciseId
  });

  if (!errorCount.count) {
    await statisticsDb.createExerciseCountEntry({ userId, guideId, courseId, exerciseId });
  }

  await statisticsDb.increaseErrorCount({
    userId, guideId, courseId, exerciseId, count: errorCount.count + 1
  });
};

/**
 * Update step count
 *
 */
const updateTotalStepsCount = async ({ userId, guideId, courseId, exerciseId, stepsCount }) => {
  const statisticCount = await statisticsDb.getExerciseStepCountEntry({
    userId, guideId, courseId, exerciseId
  });
  if (!statisticCount) {
    await statisticsDb.createTotalStepsCountEntry({
      userId, guideId, courseId, exerciseId, stepsCount
    });
  }
};

/**
 * Get course error count statistics.
 *
 */
const getErrorCountStatistics = async ({ context, courseId }) => {
  const errorCount = await statisticsDb.getExercisesErrorCount({ context, courseId });

  const byGuide = groupByProperty(errorCount, 'guideId');

  return byGuide.list.map((guideId) => {
    const exercises = byGuide.objs[guideId];

    return { guideId, exercises };
  });
};


/**
 * Get course step count statistics.
 *
 */
const getStepCountStatistics = async ({ context, courseId }) => {
  const exercisesStepCount = await statisticsDb.getExercisesTotalStepCount({ context, courseId });

  const byGuide = groupByProperty(exercisesStepCount, 'guideId');

  return byGuide.list.map((guideId) => {
    const byExercise = groupByProperty(byGuide.objs[guideId], 'exerciseId');

    const exercises = byExercise.list.map((exerciseId) => {
      const exercisesGroupedByUsers = byExercise.objs[exerciseId];
      const users = exercisesGroupedByUsers.map(({ userId }) => userId);
      const totalCount = exercisesGroupedByUsers.reduce((acum, { count }) => acum + count, 0);

      return { exerciseId, name: exercisesGroupedByUsers[0].name, users, count: totalCount };
    });

    return { guideId, exercises };
  });
};


const groupByProperty = (statisticsObjs, groupTag) => {
  const groupList = [];
  const groupObjects = {};

  statisticsObjs.forEach((statistic) => {
    const group = statistic[groupTag];

    if (!groupList.includes(group)) {
      groupList.push(group);
    }
    if (!groupObjects[group]) {
      groupObjects[group] = [];
    }
    groupObjects[group].push(statistic);
  });

  return {
    list: groupList,
    objs: groupObjects
  };
};


module.exports = {
  addInvalidStep,
  getErrorCountStatistics,
  getStepCountStatistics,
  updateTotalStepsCount
};
