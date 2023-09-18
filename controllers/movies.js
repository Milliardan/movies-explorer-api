const { mongoose } = require('mongoose');

const { Movie } = require('../models/movie');
const { ConflictError, ForbiddenError, NotFoundError } = require('../errors');
const { handleMongooseError } = require('../utils/handleMongooseError');
const { ERROR_MESSAGES } = require('../utils/constants');

async function getMovies(req, res, next) {
  try {
    const userId = req.user._id;
    const movies = await Movie.find({ owner: { $in: [userId] } }).populate('owner');
    res.send(movies);
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

    // Попытка найти фильм по movieId
    const existingMovie = await Movie.findOne({ movieId });

    // Если фильм с таким movieId уже существует
    if (existingMovie) {
      // Проверяем, что ownerId не совпадает с текущим ownerId
      if (!existingMovie.owner.includes(ownerId)) {
        // Если ownerId не совпадает, добавляем ownerId к списку владельцев
        existingMovie.owner.push(ownerId);

        // Сохраняем обновленный фильм
        const updatedMovie = await existingMovie.save();

        res.status(200).send(updatedMovie);
      } else {
        // Если ownerId совпадает, возвращаем ошибку конфликта
        next(new ConflictError(ERROR_MESSAGES.MOVIE_CONFLICT));
      }
    } else {
      // Если фильм с таким movieId не существует, создаем новый фильм с owner
      const newMovie = await Movie.create({
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
        owner: [ownerId], // Создаем массив владельцев с текущим ownerId
      });

      res.status(201).send(newMovie);
    }
  } catch (err) {
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
    const userId = req.user._id;

    const updatedMovie = await Movie.findOneAndUpdate(
      { _id: id, owner: userId }, // Условие для поиска фильма с текущим пользователем владельцем
      { $pull: { owner: userId } }, // Удалить текущего пользователя из массива owner
      { new: true } // Вернуть обновленный документ
    );

    if (!updatedMovie) {
      throw new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }

    res.send(updatedMovie);
  } catch (err) {
    if (err instanceof mongoose.Error) {
      next(handleMongooseError(err));
      return;
    }

    next(err);
  }
}

module.exports = { getMovies, saveMovie, deleteMovie };
