exports.up = (knex) => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    create TYPE type as enum('derivative', 'integral');
    create TYPE difficulty as enum('easy', 'medium', 'hard');
    create TYPE exercise_state as enum('delivered', 'resolved', 'incompleted');
    create TYPE pipeline_status as enum('waiting', 'generated', 'failed');

    CREATE TABLE exercises(
      exercise_id CHARACTER VARYING(128) DEFAULT uuid_generate_v4() NOT NULL,
      guide_id    CHARACTER VARYING(128) NOT NULL,
      course_id   CHARACTER VARYING(128) NOT NULL,
      created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

      problem_input   TEXT NOT NULL,
      name            CHARACTER VARYING(64) NOT NULL,
      description     CHARACTER VARYING(64),
      initial_hint    CHARACTER VARYING(256),
      type            type NOT NULL,
      difficulty      difficulty NOT NULL,
      pipeline_status pipeline_status NOT NULL DEFAULT 'waiting',
      math_tree       TEXT,
      PRIMARY KEY (exercise_id, course_id, guide_id)
    );

    CREATE TABLE student_exercises(
      user_id      CHARACTER VARYING(64) NOT NULL,
      guide_id     CHARACTER VARYING(128) NOT NULL,
      course_id    CHARACTER VARYING(128) NOT NULL,
      exercise_id  CHARACTER VARYING(128) NOT NULL,
      created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

      step_list    TEXT NOT NULL DEFAULT '"[]"',
      state        exercise_state NOT NULL DEFAULT 'incompleted',
      calification INT DEFAULT NULL,
      PRIMARY KEY (user_id, exercise_id, course_id, guide_id)
    );

    CREATE TABLE exercise_error_count(
      user_id      CHARACTER VARYING(64) NOT NULL,
      guide_id     CHARACTER VARYING(128) NOT NULL,
      course_id    CHARACTER VARYING(128) NOT NULL,
      exercise_id  CHARACTER VARYING(128) NOT NULL,

      count        INT DEFAULT 0,
      PRIMARY KEY  (user_id, exercise_id, course_id, guide_id)
    );
  `;

  return knex.raw(query);
};

exports.down = (knex) => {
  const query = `
    DROP TABLE IF EXISTS exercises;
    DROP TABLE IF EXISTS student_exercises;
    DROP TABLE IF EXISTS exercise_error_count;
    DROP TYPE IF EXISTS type;
    DROP TYPE IF EXISTS difficulty;
    DROP TYPE IF EXISTS pipeline_status;
    DROP TYPE IF EXISTS exercise_state;
  `;

  return knex.raw(query);
};
