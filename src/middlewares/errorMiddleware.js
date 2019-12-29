const logger = require('../utils/logger.js');

/**
 * Log when an error occurs.
 *
 */
module.exports = (err, req, res, next) => {
  if (err) {
    logger.onError(req.url, res, err);

    return res.status(err.status || 500)
      .json(err);
  }
  return next();
};
