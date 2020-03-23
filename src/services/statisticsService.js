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
    await statisticsDb.createErrorCountEntry({ userId, guideId, courseId, exerciseId });
  }

  await statisticsDb.increaseErrorCount({
    userId, guideId, courseId, exerciseId, count: errorCount.count + 1
  });
};


/**
 * Get exercise error count statistics.
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

const groupByProperty = (activityObjs, groupTag) => {
  const groupList = [];
  const groupObjects = {};

  activityObjs.forEach((activity) => {
    const group = activity[groupTag];

    if (!groupList.includes(group)) {
      groupList.push(group);
    }
    if (!groupObjects[group]) {
      groupObjects[group] = [];
    }
    groupObjects[group].push(activity);
  });

  return {
    list: groupList,
    objs: groupObjects
  };
};


module.exports = {
  addInvalidStep,
  getErrorCountStatistics
};
