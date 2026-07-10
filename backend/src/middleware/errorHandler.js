const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const response = {
    message: statusCode >= 500 ? 'Internal server error.' : error.message,
  };

  if (error.details) {
    response.errors = error.details;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
