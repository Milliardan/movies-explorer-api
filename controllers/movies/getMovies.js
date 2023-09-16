const { Movie } = require('../../models/movie');
const { NotFoundError } = require('../../errors');
const { ERROR_MESSAGES } = require('../../utils/constants');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => {
      if (!movies) {
        throw new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND);
      }
      res.send(movies);
    })
    .catch(next);
};

module.exports = { getMovies };
