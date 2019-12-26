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
        hostname: 'localhost',
        port: '5000'
      },
      paths: {
        validate: '/validate',
        resolve: '/resolve',
        help: '/help',
      }
    },
    usersService: {
      url: {
        protocol: 'http',
        hostname: 'localhost',
        port: '7000'
      },
      paths: {
        auth: 'login'
      }
    },
    coursesService: {
      url: {
        protocol: 'http',
        hostname: 'localhost',
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
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgres',
      database: 'exercises_service'
    }
  }
};
