require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cors = require('cors');

const { serverError } = require('./errors/serverError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes/index');
const limiter = require('./middlewares/rateLimit');
const { PORT, DB_HOST } = require('./utils/config');

const app = express();

mongoose.connect(DB_HOST, { useNewUrlParser: true });

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use(cors({
  credentials: true,
  origin: [
    'https://localhost:3000',
    'http://localhost:3000',
    'https://localhost:3001',
    'http://localhost:3001',
    'https://alena.moviesexplorer.nomoredomains.sbs',
    'http://alena.moviesexplorer.nomoredomains.sbs',
    'https://api.alena.moviesexplorer.nomoredomains.sbs',
    'http://api.alena.moviesexplorer.nomoredomains.sbs',
    'https://web.postman.co',
  ],
}));

// логгер запросов
app.use(requestLogger);

app.use(limiter);

app.use('/', router);

// логгер ошибок
app.use(errorLogger);

app.use(errors());

// централизованный обработчик ошибок
app.use(serverError);

app.listen(PORT, () => {
  console.log(`Сервер на порту ${PORT} успешно запущен`);
});
