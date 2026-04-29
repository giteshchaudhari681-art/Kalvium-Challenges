const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  let error = err;

  if (err.code === 'P2002') {
    error = new AppError('A record with that value already exists', 409);
  } else if (err.code === 'P2025') {
    error = new AppError('Record not found', 404);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: true,
    message,
    statusCode,
  });
}

module.exports = errorHandler;
