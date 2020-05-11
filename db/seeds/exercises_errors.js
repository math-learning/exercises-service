const addErrorsToExistingExercises = async (knex) => {
  const difErrorCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const errorCountEntries = [];

  const userExercises = await knex('student_exercises')
    .distinct('user_id', 'course_id', 'guide_id', 'exercise_id');

  for (const exercise of userExercises) { // eslint-disable-line no-restricted-syntax
    if (Math.random() < 0.4) {
      errorCountEntries.push({
        user_id: exercise.user_id,
        course_id: exercise.course_id,
        guide_id: exercise.guide_id,
        exercise_id: exercise.exercise_id,
        count: difErrorCounts[Math.floor(Math.random() * difErrorCounts.length)]
      });
    }
  }
  await knex('exercise_error_count').insert(errorCountEntries);
};

module.exports = {
  addErrorsToExistingExercises
};
