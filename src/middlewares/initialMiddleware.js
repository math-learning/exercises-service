/**
 * Initialize the context.
 *
 */
module.exports = (req, res, next) => {
  req.context = {
    accessToken: req.headers.authorization
  };

  return next();
};
