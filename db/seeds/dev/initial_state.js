
exports.seed = async (knex) => {
  const currentExercises = await knex('exercises').select();
  const currentStudentExercises = await knex('student_exercises').select();

  // Professors in users service
  const lucas = {
    user_id: '111975156652135962164'
  };
  const diego = {
    user_id: '117307029770597899245'
  };
  const mendez = {
    user_id: 'mendez-id'
  };
  const grymberg = {
    user_id: 'grymberg-id'
  };
  const juanma = {
    user_id: 'juanma-id'
  };

  // Students in users service
  const licha = {
    user_id: 'licha-id'
  };
  const pillud = {
    user_id: 'pillud-id'
  };
  const milito = {
    user_id: 'milito-id'
  };
  const diaz = {
    user_id: 'diaz-id'
  };

  // Users of courses
  const usersOfAMII = [{
    ...diego,
    course_id: 'analisis-matematico-ii-curso-2',
    role: 'creator'
  }, {
    ...lucas,
    course_id: 'analisis-matematico-ii-curso-2',
    role: 'professor'
  }];

  const usersOfAMInf = [{
    ...lucas,
    course_id: 'analisis-matematico-infinito-curso-2',
    role: 'creator'
  }, {
    ...diego,
    course_id: 'analisis-matematico-infinito-curso-2',
    role: 'professor'
  }, {
    ...juanma,
    course_id: 'analisis-matematico-infinito-curso-2',
    role: 'professor'
  }, {
    ...mendez,
    course_id: 'analisis-matematico-infinito-curso-2',
    role: 'professor'
  }, {
    ...pillud,
    course_id: 'analisis-matematico-ii-curso-2',
    role: 'student'
  }, {
    ...licha,
    course_id: 'analisis-matematico-ii-curso-2',
    role: 'student'
  }, {
    ...milito,
    course_id: 'analisis-matematico-ii-curso-2',
    role: 'student'
  }, {
    ...diaz,
    course_id: 'analisis-matematico-ii-curso-2',
    role: 'student'
  }];

  const usersOfAlgoII = [{
    ...mendez,
    course_id: 'algo-ii-curso-2',
    role: 'creator'
  }, {
    ...juanma,
    course_id: 'algo-ii-curso-2',
    role: 'student'
  }, {
    ...lucas,
    course_id: 'algo-ii-curso-2',
    role: 'student'
  }, {
    ...diego,
    course_id: 'algo-ii-curso-2',
    role: 'student'
  }];

  const usersOfAlgeII = [{
    ...juanma,
    course_id: 'algebra-ii-curso-2',
    role: 'creator'
  }, {
    ...lucas,
    course_id: 'algebra-ii-curso-2',
    role: 'student'
  }, {
    ...diego,
    course_id: 'algebra-ii-curso-2',
    role: 'student'
  }];

  const usersOfProba = [{
    ...grymberg,
    course_id: 'proba-1',
    role: 'creator'
  }, {
    ...lucas,
    course_id: 'proba-1',
    role: 'student'
  }, {
    ...diego,
    course_id: 'proba-1',
    role: 'student'
  }, {
    ...mendez,
    course_id: 'proba-1',
    role: 'student'
  }];

  const usersOfGreatCourses = [
    ...usersOfAMII,
    ...usersOfAMInf,
    ...usersOfAlgeII,
    ...usersOfAlgoII,
    ...usersOfProba
  ];

  const idsOfDefaultCourses = ['alg-III', 'alg-IV', 'fisica-cuantica', 'am-easy', 'am-easy-ii', 'am-medium'];
  const usersOfDefaultCourses = idsOfDefaultCourses.reduce((acum, courseId) => {
    const defaultUsers = [{
      ...mendez,
      course_id: courseId,
      role: 'creator'
    }, {
      ...grymberg,
      course_id: courseId,
      role: 'professor'
    }];

    return [
      ...acum,
      ...defaultUsers
    ];
  }, []);


  // Exercise Templates
  const derivativeExercises = [{
    guide_id: 'derivadas',
    exercise_id: 'derivative-i',
    problem_input: '\\frac{d\\left(e^x \\cdot \\ x\\right)}{dx}\\ +\\ \\frac{d\\left(sen\\left(x\\right)\\cdot x^2\\right)}{dx}',
    name: 'Derivada ejercicio 1',
    description: 'calcula la derivada por pasos',
    type: 'derivative',
    difficulty: 'easy'
  }, {
    guide_id: 'derivadas',
    exercise_id: 'derivative-ii',
    problem_input: '\\frac{d\\left(x^2+x\\ +\\cos \\left(x\\right)\\right)}{dx}',
    name: 'Derivada ejercicio 2',
    description: 'calcula la derivada por pasos',
    type: 'derivative',
    difficulty: 'normal' // TODO: change to medium
  }, {
    guide_id: 'derivadas',
    exercise_id: 'derivative-iii',
    problem_input: '\\frac{d(\\frac{sen(x)}{\\cos(x)})} {dx}',
    name: 'Derivada ejercicio 3',
    description: 'calcula la derivada por pasos',
    type: 'derivative',
    difficulty: 'hard'
  }, {
    guide_id: 'derivadas',
    exercise_id: 'derivative-iv',
    problem_input: '\\frac{d\\left(x^2 \\cdot \\sin(x) \\cdot \\cos \\left(x\\right)\\right)}{dx}',
    name: 'Derivada ejercicio 4',
    description: 'calcula la derivada por pasos',
    type: 'derivative',
    difficulty: 'easy'
  }, {
    guide_id: 'derivadas',
    exercise_id: 'derivative-v',
    problem_input: '\\frac{d\\left(e^3  \\cdot x \\right)}{dx}',
    name: 'Derivada ejercicio 5',
    description: 'calcula la derivada por pasos',
    type: 'derivative',
    difficulty: 'hard'
  }];

  const integralExercises = [{
    guide_id: 'integrales',
    exercise_id: 'integral-i',
    problem_input: '\\frac{d(\\frac{ \\frac{d(sen(x))}{dx}}{\\cos(x)})} {dx}',
    name: 'Derivada ejercicio 1',
    description: 'calcula la derivada por pasos',
    type: 'integral',
    difficulty: 'easy'
  }, {
    guide_id: 'integrales',
    exercise_id: 'integral-ii',
    problem_input: '\\frac{d\\left(  \\frac{d\\left(e^x\\right)}{dx} \\right)}{dx}',
    name: 'Derivada ejercicio 2',
    description: 'calcula la integral por pasos',
    type: 'integral',
    difficulty: 'normal'
  }, {
    guide_id: 'integrales',
    exercise_id: 'integral-iii',
    problem_input: '\\frac{d\\left(e^x\\right)}{dx}',
    name: 'Derivada ejercicio 2',
    description: 'calcula la integral por pasos',
    type: 'integral',
    difficulty: 'hard'
  }];

  const exercisesModels = [...derivativeExercises, ...integralExercises];


  // Great courses
  const idsOfGreatCourse = ['analisis-matematico-ii-curso-2', 'analisis-matematico-infinito-curso-2', 'algo-ii-curso-2', 'proba-1', 'algebra-ii-curso-2'];
  const exercisesOfGreatCourses = idsOfGreatCourse.reduce((acum, course_id) => ( // eslint-disable-line
    [
      ...acum,
      ...exercisesModels.map((ex) => ({ ...ex, course_id }))
    ]
  ), []);

  const greatUserExercises = usersOfGreatCourses.reduce((acum, user) => (
    [
      ...acum,
      ...exercisesModels.map((ex) => ({
        user_id: user.user_id,
        course_id: user.course_id,
        guide_id: ex.guide_id,
        exercise_id: ex.exercise_id,
        step_list: JSON.stringify([]),
        state: 'incompleted',
        calification: null
      }))
    ]
  ), []);


  // Default courses
  const exercisesOfDefaultCourses = idsOfDefaultCourses.reduce((acum, course_id) => ( // eslint-disable-line
    [
      ...acum,
      ...exercisesModels.map((ex) => ({ ...ex, course_id })),
    ]
  ), []);

  const defaultUserExercises = usersOfDefaultCourses.reduce((acum, user) => (
    [
      ...acum,
      ...exercisesModels.map((ex) => ({
        user_id: user.user_id,
        course_id: user.course_id,
        guide_id: ex.guide_id,
        exercise_id: ex.exercise_id,
        step_list: JSON.stringify([]),
        state: 'incompleted',
        calification: null
      }))
    ]
  ), []);


  // Inserting
  const exerciseTemplates = [
    ...exercisesOfGreatCourses,
    ...exercisesOfDefaultCourses
  ];

  const userExercises = [
    ...greatUserExercises,
    ...defaultUserExercises
  ];

  if (!currentExercises.length) {
    await knex('exercises').insert(exerciseTemplates);
  }
  if (!currentStudentExercises.length) {
    await knex('student_exercises').insert(userExercises);
  }
};
