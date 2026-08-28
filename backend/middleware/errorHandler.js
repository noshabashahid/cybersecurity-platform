// Centralized error handler — never leaks stack traces to the client.
function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Resource not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large.' });
  }
  if (err && err.message === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({ success: false, message: 'Unsupported image type. Use PNG, JPG, JPEG, or WEBP.' });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Something went wrong on our end. Please try again shortly.' : err.message;
  res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
