const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = require('../utils/config');

const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFound = require('../errors/NotFound');
const Conflict = require('../errors/Conflict');
const Unauthorized = require('../errors/Unauthorized');

/* возвращает пользователя */
module.exports.getUser = (req, res, next) => {
  const { email, name } = req.body;
  User.findOne({ email, name })
    .then((user) => {
      res.send({
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => next(err));
};

/* обновляет информацию о пользователе */
module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findOneAndUpdate({ email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFound('Запрашиваемый пользователь не найден');
      }
      return res.send({
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(`Данные некорректны ${err.message}`));
        return;
      }
      next(err);
    });
};

/* создание пользователя */
module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new Conflict('Такой пользователь уже зарегистрирован');
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(`Данные некорректны ${err.message}`));
      }
      return next(err);
    })
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
      console.log(token);
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new Unauthorized('Неверные почта или пароль'));
      }
    });
};
