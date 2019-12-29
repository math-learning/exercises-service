const coursesClient = require('../clients/coursesClient');

/**
 * Executes authentication and saves the profile in the context.
 *
 */
module.exports = async (req, res, next) => {
  const { context, params } = req;
  const { courseId } = params;

  try {
    // if not fails, indicates that the course exists
    await coursesClient.getCourse({ context, courseId });
    next();
  } catch (err) {
    next(err);
  }
};
