const url = require('url');
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
    body: JSON.stringify({
      problem_input: {
        expression: problemInput,
        variables: []
      },
      type
    }),
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
  const mathTreePath = configs.services.mathResolverService.paths.mathTree;
  const fullPath = `${mathResolverServiceUrl}${mathTreePath}`;

  const response = await fetch(fullPath, {
    method: 'post',
    body: JSON.stringify({
      problem_input: {
        expression: problemInput,
        variables: []
      },
      type
    }),
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
      problem_input: {
        expression: problemInput,
        variables: []
      },
      type,
      step_list: stepList,
      math_tree: mathTree,
      current_expression: currentExpression
    }),
    headers: {
      authorization: context.accessToken,
      'Content-Type': 'application/json'
    }
  });

  return requestUtils.processResponse(response);
};

const askHelp = async ({ context, type, problemInput, stepList }) => {
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
