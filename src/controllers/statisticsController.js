const expressify = require('expressify')();
const statisticsService = require('../services/statisticsService');

/**
 * Get exercise error count statistics.
 *
 */
const getErrorCountStatistics = async (req, res) => {
  const { courseId } = req.params;

  const errorCountStatistics = await statisticsService.getErrorCountStatistics({
    context: req.context, courseId
  });

  return res.status(200).json(errorCountStatistics);
};

/**
 * Get exercise step count statistics.
 *
 */
const getStepCountStatistics = async (req, res) => {
  const { courseId } = req.params;

  const stepsCountStatistics = await statisticsService.getStepCountStatistics({
    context: req.context, courseId
  });

  return res.status(200).json(stepsCountStatistics);
};

module.exports = expressify({
  getErrorCountStatistics,
  getStepCountStatistics
});
