const { NODE_ENV } = process.env;
const url = require('url');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const createError = require('http-errors');
const requestUtils = require('../utils/requestUtils');
const configs = require('../config')();

const mathResolverServiceUrl = url.format(configs.services.mathResolverService.url);

const evaluate = async ({ context, problemInput, type }) => {
  const evaluatePath = configs.services.mathResolverService.paths.evaluate;
  const fullPath = `${mathResolverServiceUrl}${evaluatePath}`;

  const response = await fetch(fullPath, {
    method: 'post',
    body: JSON.stringify({ problem_input: problemInput, type }),
    headers: {
      authorization: context.accessToken,
      'Content-Type': 'application/json'
    }
  });

  try {
    return requestUtils.processResponse(response);
  } catch (e) {
    if (e.status === 400) {
      throw createError(400, { message: 'Ejercicio mal formado' });
    }
    throw e;
  }
};

const generateMathTree = async ({ context, problemInput, type }) => {
  let theorems = [];
  if (type === 'derivative') {
    theorems = fs.readFileSync(path.resolve(__dirname, './derivative-theorems.json'));
  } else if (type === 'integral') {
    theorems = fs.readFileSync(path.resolve(__dirname, './integral-theorems.json'));
  }
  const mathTreePath = configs.services.mathResolverService.paths.mathTree;
  const fullPath = `${mathResolverServiceUrl}${mathTreePath}`;

  const response = await fetch(fullPath, {
    method: 'post',
    body: JSON.stringify({ problem_input: problemInput, type, theorems: JSON.parse(theorems) }),
    headers: {
      authorization: context.accessToken,
      'Content-Type': 'application/json'
    }
  });

  return requestUtils.processResponse(response);
};

const resolve = async ({
  context, type, problemInput, stepList, mathTree = {}, currentExpression
}) => {
  const resolvePath = configs.services.mathResolverService.paths.resolve;
  const fullPath = `${mathResolverServiceUrl}${resolvePath}`;

  const response = await fetch(fullPath, {
    method: 'post',
    body: JSON.stringify({
      type,
      problem_input: problemInput,
      step_list: stepList,
      math_tree: mathTree,
      current_expression: currentExpression
    }),
    headers: {
      authorization: context.accessToken,
      'Content-Type': 'application/json'
    }
  });

  if (response.status <= 300) {
    return requestUtils.processResponse(response);
  }

  console.log('Error while trying to resolve exercise');

  if (NODE_ENV === 'dev') { // TODO: remove it
    const possibleResponses = ['valid', 'invalid', 'valid', 'invalid', 'valid', 'invalid', 'valid', 'invalid', 'resolved'];
    return Promise.resolve({
      exerciseStatus: possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
    });
  }
  throw createError(response.status, await response.json());
};

const askHelp = async ({ context, type, problemInput, stepList }) => {
  if (NODE_ENV === 'dev') { // TODO: remove it
    return Promise.resolve({ help: 'Intente usar derivada de la suma' });
  }

  const helpPath = configs.services.mathResolverService.paths.help;
  const fullPath = `${mathResolverServiceUrl}${helpPath}`;

  const response = await fetch(fullPath, {
    method: 'post',
    body: JSON.stringify({
      type,
      problemInput,
      stepList
    }),
    headers: {
      authorization: context.accessToken,
      'Content-Type': 'application/json'
    }
  });

  return requestUtils.processResponse(response);
};

module.exports = {
  askHelp,
  evaluate,
  generateMathTree,
  resolve,
};
