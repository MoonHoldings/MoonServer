const ErrorHandler = require("../utils/errorHandler")

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(new ErrorHandler("You are already logged in", 401))
  }
  return next()
}
