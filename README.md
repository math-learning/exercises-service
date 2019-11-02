# Exercises-service

[![Coverage Status](https://coveralls.io/repos/github/math-learning/exercises-service/badge.svg)](https://coveralls.io/github/math-learning/exercises-service)

Service of the Math Learning platform. Used to store and resolve different type of exercises.


## Steps to prepare the environment

After start the server you will need postgres and npm.


### Install NPM and Node

1. Download node and npm. https://nodejs.org/en/

2. Once node is installed, run `npm install` to install all the dependencies of the project


### Set up the Database

1. Install postgres. For ubuntu guys: `sudo apt install postgresql postgresql-contrib`.

2. Once node is installed, it is neccesary to create the database. Run `sudo -i -u postgres` to enter in the postgres console.

3. Once in the console, write `psql` and create the users database for the development and tests: write `CREATE DATABASE exercises_service;` and then `CREATE DATABASE exercises_service_test;`

4. Install the following global dependency: `npm install knex -g` 


_Note_: If you already has postgres and psql you can just write `PGPASSWORD=postgres psql -U postgres` to enter in the psql console, then do the step 3.

_Note_: If you want to change the postgres user and/or password, edit the file `./configs/` with this configuration.

_Note_: If you want to create a new migration file you should run `NODE_ENV=ENV knex migrate:make MIGRATION_NAME`, replacing `ENV` and `MIGRATION_NAME`

_Note_: For more information about postgres migrations, read http://knexjs.org/#Migrations-CLI



## Start the server

#### `npm start`

_Note_: Now your server is ready in the port specified in the file `./configs.js`. By default the port `9000` is choosen.


## Run tests

Before all, run `npm install eslint -g` to install the eslint flobal dependency

#### `npm test`

Launches the test runner for the application.

#### `npm run lint`

Launches the linter test runner to check the code syntaxis.

#### `npm run test:app`

If you only want to run the tests for the application and not the linter, you can execute this command
