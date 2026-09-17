const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 5,                    // 5 attempts per window per IP
  message: { error: 'TOO_MANY_ATTEMPTS', message: 'Too many login attempts, try again shortly.' },
  standardHeaders: true,     // sends RateLimit-* headers so the client can see how many attempts remain
  legacyHeaders: false
});

module.exports = loginLimiter;