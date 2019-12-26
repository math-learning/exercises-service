const url = require('url');
const fetch = require('node-fetch');
const requestUtils = require('../utils/requestUtils');
const configs = require('../config')();

const usersServiceUrl = url.format(configs.services.usersService.url);

const authenticate = async ({ context }) => {
  const authPath = configs.services.usersService.paths.auth;
  const authUrl = `${usersServiceUrl}/${authPath}`;

  console.log(authUrl, authPath, context.accessToken)
  const response = await fetch(authUrl, {
    headers: {
      Authorization: context.accessToken
    }
  });

  return requestUtils.processResponse(response);
};

module.exports = {
  authenticate
};
