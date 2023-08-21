require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');

const { limiter } = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { routes } = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const configDefault = require('./utils/configDefault');

const {
  PORT = configDefault.PORT,
  DATABASE_URL = configDefault.DATABASE_URL,
} = process.env;

const app = express();

async function startServer() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log(`Connected to database on ${DATABASE_URL}`);

    app.use(limiter);
    app.use(cors());
    app.use(requestLogger);
    app.use(helmet());
    app.use(routes);

    app.use(errorLogger);
    app.use(errors());
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`App started on port ${PORT}...`);
    });
  } catch (error) {
    console.error('Error on database connection');
    console.error(error);
  }
}

startServer();
