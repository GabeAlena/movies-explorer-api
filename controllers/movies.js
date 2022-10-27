const Movie = require('../models/movie');
const ValidationError = require('../errors/ValidationError');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');

/* возвращает все фильмы */
module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch((err) => next(err));
};

/* создает фильм */
module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    owner,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  })
    .then((movie) => res/*.status(201)*/.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(`Данные некорректны ${err.message}`);
      }
      return next(err);
    })
    .catch(next);
};

/* удаляет фильм по идентификатору */
module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;
  //Movie.findByIdAndRemove(req.params.movieId)
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFound('Запрашиваемый фильм не найден');
      } else if (movie.owner.toString() !== userId) {
        throw new Forbidden('Запрещено удалять чужие фильмы!');
      }/* else {
        return movie.remove()
          .then(() => res.status(200).send('Фильм успешно удален'));
        Movie.findByIdAndRemove(movieId)
          .then(() => res.send('Фильм успешно удален'));
      }*/
      return movie;
    })
    .then((movie) => movie.delete())
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(`Данные некорректны ${err.message}`));
      }
      next(err);
    });
};
