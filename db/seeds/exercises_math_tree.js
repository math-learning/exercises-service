const fs = require('fs');
const path = require('path');

const addMathTreeToExistingExercises = async (knex) => {
  const exercises = await knex('exercises').select();

  for (const exercise of exercises) { // eslint-disable-line no-restricted-syntax
    const mathTree = fs.readFileSync(path.resolve(__dirname, `./math-trees/${exercise.exercise_id}.json`));

    await knex('exercises') // eslint-disable-line no-await-in-loop
      .update({ math_tree: mathTree, pipeline_status: 'generated' })
      .where('course_id', exercise.course_id)
      .where('guide_id', exercise.guide_id)
      .where('exercise_id', exercise.exercise_id);
  }
};

module.exports = {
  addMathTreeToExistingExercises
};
