module.exports = {
  app: {
    protocol: 'http',
    hostname: 'localhost',
    port: process.env.PORT || '9000'
  },
  services: {
    mathResolverService: {
      url: process.env.MATH_SOLVER_URL || 'https://math-solver.herokuapp.com/',
      paths: {
        evaluate: '/validations/evaluate',
        resolve: '/resolve',
        mathTree: '/results/solution-tree',
        help: '/help',
      }
    },
    usersService: {
      url: process.env.USERS_SERVICE_URL || 'https://math-learning-users-service.herokuapp.com/',
      paths: {
        auth: 'login'
      }
    },
    coursesService: {
      url: process.env.COURSES_SERVICE_URL || 'https://math-learning-courses-service.herokuapp.com/',
      paths: {
        course: ({ courseId }) => `/courses/${courseId}`,
        guide: ({ courseId, guideId }) => `/courses/${courseId}/guides/${guideId}`
      },
    }
  },
  db: {
    client: 'pg',
    version: '10.10',
    connection: process.env.DATABASE_URL
  }
};
