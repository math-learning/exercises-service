const _ = require('lodash');

const camilize = (obj) => {
  const newObj = {};

  Object.keys(obj)
    .forEach((key) => {
      newObj[_.camelCase(key)] = obj[key];
    });

  return newObj;
};

const snakelize = (obj) => {
  const newObj = {};

  Object.keys(obj)
    .forEach((key) => {
      if (obj[key]) { // to prevent null objects are inserted
        newObj[_.snakeCase(key)] = obj[key];
      }
    });

  if (Object.keys(newObj).lenght === 0) {
    throw new Error('Can not snakelize empty objects');
  }

  return newObj;
};


const processDbResponse = (dbObj) => (
  _.isArray(dbObj) ? dbObj.map((item) => camilize(item)) : camilize(dbObj)
);


module.exports = {
  camilize,
  snakelize,
  processDbResponse
};
