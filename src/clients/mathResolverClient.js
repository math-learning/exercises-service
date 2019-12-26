const url = require('url');
const fetch = require('node-fetch');
const requestUtils = require('../utils/requestUtils');
const configs = require('../config')();

const mathResolverServiceUrl = url.format(configs.services.mathResolverService.url);

const validate = async ({ context, problemInput, type }) => {
  return Promise.resolve({});

  // const validatePath = configs.services.mathResolverService.paths.validate;
  // const path = `${mathResolverServiceUrl}${validatePath}`;

  // const response = await fetch(path, {
  //   method: 'post',
  //   body: JSON.stringify({ problemInput, type }),
  //   headers: {
  //     authorization: context.accessToken,
  //     'Content-Type': 'application/json'
  //   }
  // });

  // return requestUtils.processResponse(response);
};

const resolve = async ({
  context, type, problemInput, stepList, currentExpression
}) => {
  const possibleResponses = ['valid', 'invalid', 'valid', 'invalid', 'valid', 'invalid', 'valid', 'invalid', 'resolved'];

  return Promise.resolve({
    exerciseStatus: possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
  });

  // const resolvePath = configs.services.mathResolverService.paths.resolve;
  // const path = `${mathResolverServiceUrl}${resolvePath}`;

  // const response = await fetch(path, {
  //   method: 'post',
  //   body: JSON.stringify({
  //     type,
  //     problemInput,
  //     stepList,
  //     currentExpression // TODO: PODRIAMOS NO MANDAR EL currentExpression
  //   }),
  //   headers: {
  //     authorization: context.accessToken,
  //     'Content-Type': 'application/json'
  //   }
  // });

  // return requestUtils.processResponse(response);
};

const askHelp = async ({ context, type, problemInput, stepList }) => {
  return Promise.resolve({
    help: 'Intente usar derivada de la suma'
  });

  // const helpPath = configs.services.mathResolverService.paths.help;
  // const path = `${mathResolverServiceUrl}${helpPath}`;

  // const response = await fetch(path, {
  //   method: 'post',
  //   body: JSON.stringify({
  //     type,
  //     problemInput,
  //     stepList
  //   }),
  //   headers: {
  //     authorization: context.accessToken,
  //     'Content-Type': 'application/json'
  //   }
  // });

  // return requestUtils.processResponse(response);
};

module.exports = {
  askHelp,
  resolve,
  validate
};
