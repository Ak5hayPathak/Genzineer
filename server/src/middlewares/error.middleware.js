const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    statusCode,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Something went wrong",
    success: false,
    errors: err.errors || [],
  });
};

export { errorHandler };
