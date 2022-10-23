const jwt = require("jsonwebtoken")
const ErrorHandler = require("../utils/errorHandler")

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader?.split(" ")[1]

  if (token === null) return next(new ErrorHandler("Please login first", 401))

  const decoded = await jwt.verify(authHeader, process.env.JWT_SECRET)

  if (!decoded) {
    return next(new ErrorHandler("Something went wrong", 403))
  } else {
    req.user = user
    next()
  }
}
