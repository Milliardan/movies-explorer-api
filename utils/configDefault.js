const PORT = 3001;
const DATABASE_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb';
const JWT_SECRET = 'secret-pas';
const SALT_LENGTH = 10;
const LIMITER_WINDOW = 70000;
const LIMITER_MAX_LIMIT = 100;

module.exports = {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  SALT_LENGTH,
  LIMITER_WINDOW,
  LIMITER_MAX_LIMIT,
};
