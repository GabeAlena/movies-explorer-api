const router = require('express').Router();
const { createUserValidation, loginValidation } = require('../utils/validation');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFound = require('../errors/NotFound');

router.post('/signup', createUserValidation, createUser);
router.post('/signin', loginValidation, login);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

router.use('*', (req, res, next) => {
  next(new NotFound('Запрашиваемая страница не найдена'));
});

module.exports = router;
