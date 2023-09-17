const winston = require('winston');
const { Movie } = require('../../models/movie');

async function getMovies(req, res, next) {
  try {
    const userId = req.user._id;
    // eslint-disable-next-line no-underscore-dangle
    winston.info('testkjdsflhsdfjhsdlkfj;sdjhfjsiowej213', { user: req.user._Id });
    const movies = await Movie.find({ owner: userId }).populate('owner');
    res.send(movies);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMovies };
