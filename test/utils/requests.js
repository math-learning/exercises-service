const url = require('url');
const fetch = require('node-fetch');
const configs = require('../../configs/test');

const baseUrl = url.format(configs.app);

const status = () => {
  const statusUrl = `${baseUrl}/ping`;

  return fetch(statusUrl);
};

// Exercises
const createExercise = async ({
  token, courseId, guideId, exercise = {}
}) => {
  const createExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises`;

  const response = await fetch(createExUrl, {
    method: 'post',
    body: JSON.stringify(exercise),
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const updateExercise = async ({
  token, courseId, guideId, exerciseId, exercise = {}
}) => {
  const createExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises/${exerciseId}`;

  const response = await fetch(createExUrl, {
    method: 'put',
    body: JSON.stringify(exercise),
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const listExercises = async ({ token, courseId, guideId }) => {
  const listExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises`;

  const response = await fetch(listExUrl, {
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const removeExercise = async ({
  token,
  courseId,
  guideId,
  exerciseId
}) => {
  const listExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises/${exerciseId}`;

  const response = await fetch(listExUrl, {
    method: 'delete',
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status };
};

const addUser = async ({ token, courseId, user }) => {
  const addUserUrl = `${baseUrl}/courses/${courseId}/users`;

  const response = await fetch(addUserUrl, {
    method: 'post',
    body: JSON.stringify(user),
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

// User exercises
const listUserExercises = async ({ token, courseId, guideId }) => {
  const addUserUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/user/exercises`;

  const response = await fetch(addUserUrl, {
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const getUserExercise = async ({
  token,
  courseId,
  guideId,
  exerciseId
}) => {
  const addUserUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/user/exercises/${exerciseId}`;

  const response = await fetch(addUserUrl, {
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const updateUserExercise = async ({
  token,
  userId,
  courseId,
  guideId,
  exerciseId,
  exerciseMetadata
}) => {
  const updateExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/user/exercises/${exerciseId}`;

  const response = await fetch(`${updateExUrl}?userId=${userId}`, {
    method: 'put',
    body: JSON.stringify(exerciseMetadata),
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const resolveExercise = async ({
  token,
  courseId,
  guideId,
  exerciseId,
  currentExpression
}) => {
  const updateExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises/${exerciseId}/resolve`;

  const response = await fetch(`${updateExUrl}`, {
    method: 'post',
    body: JSON.stringify({ currentExpression }),
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};

const deleteExerciseStep = async ({
  token,
  courseId,
  guideId,
  exerciseId
}) => {
  const updateExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises/${exerciseId}/step`;

  const response = await fetch(`${updateExUrl}`, {
    method: 'delete',
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status };
};

const deliverExercise = async ({
  token,
  courseId,
  guideId,
  exerciseId
}) => {
  const updateExUrl = `${baseUrl}/courses/${courseId}/guides/${guideId}/exercises/${exerciseId}/deliver`;

  const response = await fetch(`${updateExUrl}`, {
    method: 'put',
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status };
};

const getExerciseStatistics = async ({ token, courseId }) => {
  const getExUrl = `${baseUrl}/courses/${courseId}/errors/statistics`;

  const response = await fetch(`${getExUrl}`, {
    headers: {
      authorization: token,
      'Content-Type': 'application/json'
    }
  });
  return { status: response.status, body: await response.json() };
};


function errorWrapper(funct) {
  return function inner(...args) {
    try {
      return funct(...args);
    } catch (err) {
      return err;
    }
  };
}

module.exports = {
  addUser: errorWrapper(addUser),
  createExercise: errorWrapper(createExercise),
  deliverExercise: errorWrapper(deliverExercise),
  removeExercise: errorWrapper(removeExercise),
  listExercises: errorWrapper(listExercises),
  updateExercise: errorWrapper(updateExercise),
  getUserExercise: errorWrapper(getUserExercise),
  getExerciseStatistics: errorWrapper(getExerciseStatistics),
  listUserExercises: errorWrapper(listUserExercises),
  updateUserExercise: errorWrapper(updateUserExercise),
  deleteExerciseStep: errorWrapper(deleteExerciseStep),
  resolveExercise: errorWrapper(resolveExercise),
  status
};
