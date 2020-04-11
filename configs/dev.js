const dockerHosts = {
  courses: 'courses-service',
  db: 'exercises-db',
  users: 'users-service',
  mathSolver: 'math-solver',
}

const localhosts = {
  courses: 'localhost',
  db: 'localhost',
  users: 'localhost',
  mathSolver: 'localhost',
}

const resolveHosts = () => {
  const { DOCKER } = process.env;
  return DOCKER ? dockerHosts : localhosts;
};

module.exports = {
  app: {
    protocol: 'http',
    hostname: 'localhost',
    port: '9000'
  },
  services: {
    mathResolverService: {
      url: {
        protocol: 'http',
        hostname: resolveHosts().mathSolver,
        port: '5000'
      },
      paths: {
        evaluate: '/validations/evaluate',
        resolve: '/resolve',
        mathTree: '/results/solution-tree',
        help: '/help',
      }
    },
    usersService: {
      url: {
        protocol: 'http',
        hostname: resolveHosts().users,
        port: '7000'
      },
      paths: {
        auth: 'login'
      }
    },
    coursesService: {
      url: {
        protocol: 'http',
        hostname: resolveHosts().courses,
        port: '5001'
      },
      paths: {
        course: ({ courseId }) => `/courses/${courseId}`,
        guide: ({ courseId, guideId }) => `/courses/${courseId}/guides/${guideId}`
      },
    }
  },
  db: {
    client: 'pg',
    version: '10.10',
    connection: {
      host: resolveHosts().db,
      user: 'postgres',
      password: 'postgres',
      database: 'exercises_service'
    }
  }
};
