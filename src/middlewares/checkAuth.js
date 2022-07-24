const ErrorHandler = require("../utils/errorHandler")

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(new ErrorHandler("Please login first", 401))
  }
  return next()
}
