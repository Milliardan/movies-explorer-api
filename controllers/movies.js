const winston = require('winston');
const { mongoose } = require('mongoose');

const { Movie } = require('../models/movie');
const { ConflictError, ForbiddenError, NotFoundError } = require('../errors');
const { handleMongooseError } = require('../utils/handleMongooseError');
const { ERROR_MESSAGES } = require('../utils/constants');

async function getMovies(req, res, next) {
  try {
    // const userId = req.user._id;
    // const movies = await Movie.find({ owner: userId }).populate('owner');
    res.send({ test: JSON.stringify(req.user) });
  } catch (err) {
    next(err);
  }
}

async function saveMovie(req, res, next) {
  try {
    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      nameRU,
      nameEN,
      movieId,
    } = req.body;

    const ownerId = req.user._id;

    const movie = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      nameRU,
      nameEN,
      movieId,
      owner: ownerId,
    });

    await movie.populate('owner');
    res.status(201).send(movie);
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError(ERROR_MESSAGES.MOVIE_CONFLICT));
      return;
    }

    if (err instanceof mongoose.Error) {
      next(handleMongooseError(err));
      return;
    }

    next(err);
  }
}

async function deleteMovie(req, res, next) {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id).populate('owner');

    if (!movie) {
      throw new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }

    const ownerId = movie.owner.id;
    const userId = req.user._id;

    if (ownerId !== userId) {
      throw new ForbiddenError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    await Movie.findByIdAndRemove(id);

    res.send(movie);
  } catch (err) {
    if (err instanceof mongoose.Error) {
      next(handleMongooseError(err));
      return;
    }

    next(err);
  }
}

module.exports = { getMovies, saveMovie, deleteMovie };
