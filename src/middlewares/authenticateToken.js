const jwt = require("jsonwebtoken")
const ErrorHandler = require("../utils/errorHandler")

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader?.split(" ")[1]

  if (token === null) return next(new ErrorHandler("Please login first", 401))

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new ErrorHandler("Something went wrong", 403))

    req.user = user
    next()
  })
}
