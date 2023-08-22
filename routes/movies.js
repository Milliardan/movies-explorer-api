const express = require('express');
const { getMovies, saveMovie, deleteMovie } = require('../controllers/movies');
const { saveMovieValidator, deleteMovieValidator } = require('../utils/validators');

const moviesRouter = express.Router();

moviesRouter.get('/', getMovies);

moviesRouter.post('/', saveMovieValidator, saveMovie);

moviesRouter.delete('/:id', deleteMovieValidator, deleteMovie);

module.exports = { moviesRouter };
