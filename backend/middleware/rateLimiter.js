const rateLimit = require('express-rate-limit');

// General API limiter — generous, just to blunt abuse/scraping.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
});

// Stricter limiter for auth endpoints to blunt credential-stuffing/brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in a few minutes.' },
});

// Limiter for AI-backed analysis endpoints (more expensive calls).
const analysisLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Analysis rate limit reached. Please wait a few minutes and try again.' },
});

module.exports = { apiLimiter, authLimiter, analysisLimiter };
