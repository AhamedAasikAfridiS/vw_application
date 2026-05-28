function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: statusCode === 500 ? "Internal server error." : error.message
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };
