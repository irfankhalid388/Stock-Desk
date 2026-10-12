const rateLimit = require("express-rate-limit")

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many attempts. Try again later." },
})
module.exports=resetLimiter