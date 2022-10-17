const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = require('../utils/config');

const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFound = require('../errors/NotFound');
const Conflict = require('../errors/Conflict');

/* возвращает пользователя */
module.exports.getUser = (req, res, next) => {
  const { email, name } = req.body;
  /*User.findOne({ email, name })
    .then((user) => {
      res.send({
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => next(err)); */
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound('Такого пользователя нет');
      }
      return res.send(user);
    })
    .catch((err) => next(err));
};

/* обновляет информацию о пользователе */
module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findOneAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFound('Запрашиваемый пользователь не найден');
      }
      return res.send({
        email: user.email,
        name: user.name,
        _id: user._id
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(`Данные некорректны ${err.message}`);
      } else if (err.code === 11000) {
        throw new Conflict('Такой email уже занят, попробуйте другой!');
      }
      throw err;
    })
    .catch(next);
};

/* создание пользователя */
module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10).then((hash) => User.create({
    email,
    password: hash,
    name,
  })
    .then((user) => {
      res.status(201).send({
        name: user.name,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError(`Данные некорректны ${err.message}`);
      }
      if (err.code === 11000) {
        throw new Conflict('Пользователь с таким email уже зарегистрирован');
      }
      return next(err);
    }))
    .catch(next);
};

/* контроллер, который получает из запроса почту и пароль и проверяет их (возвращает JWT) */
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'SECRET_KEY',
        { expiresIn: '7d' },
      );
      res.send({
        token,
      });
    })
    .catch(next);
};
