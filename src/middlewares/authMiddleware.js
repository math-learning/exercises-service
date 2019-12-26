const createError = require('http-errors');

const usersClient = require('../clients/usersClient');

/**
 * Executes authentication and saves the profile in the context.
 *
 */
module.exports = async (req, res, next) => {
  const { context } = req;

  if (!context.accessToken) {
    next(createError.BadRequest('Authorization has not been provided'));
  }

  try {
    const user = await usersClient.authenticate({ context });
    req.context.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
