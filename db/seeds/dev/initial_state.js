
exports.seed = async (knex) => {
  const currentExercises = await knex('exercises').select();
  const currentStudentExercises = await knex('student_exercises').select();

  // Professors in users service
  const lucas = {
    user_id: '111975156652135962164'
  };
  // const diego = {
  //   user_id: 'diego-id'
  // };
  // const mendez = {
  //   user_id: 'mendez-id'
  // };
  // const juanma = {
  //   user_id: 'juanma-id'
  // };

  // Students in users service
  // const licha = {
  //   user_id: 'licha-id'
  // };
  // const pillud = {
  //   user_id: 'pillud-id'
  // };

  const exercises = [{
    course_id: 'course',
    guide_id: 'guide',
    exercise_id: 'ex',
    problem_input: '1/2 + 4 * x dx',
    name: 'derivada',
    description: 'calcula la derivada',
    type: 'derivative',
    difficulty: 'easy',
    created_at: '2019-11-16T20:55:28.423Z'
  }];

  const userExercises = [{
    ...lucas,
    exercise_id: 'ex',
    step_list: JSON.stringify([]),
    state: 'incompleted',
    calification: null,
    created_at: '2019-11-16T20:55:28.423Z'
  }];

  if (!currentExercises.length) {
    await knex('exercises').insert(exercises);
  }
  if (!currentStudentExercises.length) {
    await knex('student_exercises').insert(userExercises);
  }




    // return {
  //   guideId: 'guide',
  //   courseId: 'course',
  //   exerciseId: 'ex',
  //   exercise: '1/2 + 4 * x dx',
  //   name: 'derivada',
  //   description: 'calcula la derivada',
  //   type: 'derivative',
  //   difficulty: 'easy',
  //   state: 'incompleted',
  //   calification: null
  // };
};
