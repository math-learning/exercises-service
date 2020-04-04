const { NODE_ENV } = process.env;
const url = require('url');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const requestUtils = require('../utils/requestUtils');
const configs = require('../config')();

const mathResolverServiceUrl = url.format(configs.services.mathResolverService.url);

const validate = async ({ context, problemInput, type }) => {
  const validatePath = configs.services.mathResolverService.paths.validate;
  const fullPath = `${mathResolverServiceUrl}${validatePath}`;

  const response = await fetch(fullPath, {
    method: 'post',
    body: JSON.stringify({ problem_input: problemInput, type }),
    headers: {
      authorization: context.accessToken,
      'Content-Type': 'application/json'
    }
  });

  return requestUtils.processResponse(response);
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
    body: JSON.stringify({ problem_input: problemInput, type, theorems }),
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

  try {
    return requestUtils.processResponse(response);
  } catch (err) {
    console.log('Error while trying to resolve exercise', err);

    if (NODE_ENV === 'dev') { // TODO: remove it
      const possibleResponses = ['valid', 'invalid', 'valid', 'invalid', 'valid', 'invalid', 'valid', 'invalid', 'resolved'];
      return Promise.resolve({
        exerciseStatus: possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
      });
    }
    throw err;
  }
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
  generateMathTree,
  resolve,
  validate,
};
