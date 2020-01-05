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
    const course = await coursesClient.getCourse({ context, courseId });
    req.context.course = course;
    next();
  } catch (err) {
    next(err);
  }
};
