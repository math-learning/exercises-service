const _ = require('lodash');
const configs = require('../../configs/test');

const knex = require('knex')(configs.db); // eslint-disable-line

const sanitizeResponse = (response) => {
  if (_.isArray(response)) {
    return response.map((obj) => sanitizeResponse(obj));
  }
  delete response.id;
  delete response.createdAt;
  return response;
};

const cleanDb = async () => {
  await knex('exercises').del();
  await knex('student_exercises').del();
  await knex('exercise_error_count').del();
};

module.exports = {
  knex,
  cleanDb,
  sanitizeResponse
};
