/* eslint-disable max-len */
const express = require('express');

const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const configs = require('./config')();

// Middlewares
const errorMiddleware = require('./middlewares/errorMiddleware');
const initialMiddleware = require('./middlewares/initialMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const requestLoggerMiddleware = require('./middlewares/requestLoggerMiddleware');
const courseValidatorMiddleware = require('./middlewares/courseValidatorMiddleware');

// Controllers
const statusController = require('./controllers/statusController');
const usersController = require('./controllers/usersController');
const exerciseController = require('./controllers/exerciseController');
const resolutionController = require('./controllers/resolutionController');

const app = express();
const { port } = configs.app;


app.use(cors());

//  Body parser middleware
app.use(bodyParser.json());
app.use(requestLoggerMiddleware);

// Routes
router.get('/ping', (req, res) => statusController.ping(req, res));

router.use(initialMiddleware);
router.use(authMiddleware);

// Users
// TODO: validar que el usuario a agregar pertenece al curso
router.post('/courses/:courseId/users', courseValidatorMiddleware, usersController.addUser);

// Exercises
// TODO: validar que es el profesor del curso el que ejecuta estas acciones
router.post('/courses/:courseId/guides/:guideId/exercises', courseValidatorMiddleware, exerciseController.create);
router.get('/courses/:courseId/guides/:guideId/exercises', courseValidatorMiddleware, exerciseController.list);
router.patch('/courses/:courseId/guides/:guideId/exercises/:exerciseId', courseValidatorMiddleware, exerciseController.update);
router.delete('/courses/:courseId/guides/:guideId/exercises/:exerciseId', courseValidatorMiddleware, exerciseController.remove);

// User Exercises
router.get('/courses/:courseId/guides/:guideId/user/exercises', courseValidatorMiddleware, usersController.listExercises);
router.get('/courses/:courseId/guides/:guideId/user/exercises/:exerciseId', courseValidatorMiddleware, usersController.getExercise);
router.put('/courses/:courseId/guides/:guideId/user/exercises/:exerciseId', courseValidatorMiddleware, usersController.updateExercise);

// Resolution
router.delete('/courses/:courseId/guides/:guideId/exercises/:exerciseId/step', courseValidatorMiddleware, resolutionController.removeStep);
router.post('/courses/:courseId/guides/:guideId/exercises/:exerciseId/resolve', courseValidatorMiddleware, resolutionController.resolve);
// router.post('/courses/:courseId/guides/:guideId/exercises/:exerciseId/help', resolutionController.askHelp);

app.use(router);

app.use(errorMiddleware);

//  Setting the invalid enpoint message for any other route
app.get('*', (req, res) => {
  res.status(400).json({ message: 'Invalid endpoint' });
});

//  Start server on port
const server = app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});

module.exports = {
  server
};
