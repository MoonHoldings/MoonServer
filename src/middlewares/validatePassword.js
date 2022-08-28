const ErrorHandler = require("../utils/errorHandler")

module.exports = (req, res, next) => {
  if (!req.body.password) {
    return next(new ErrorHandler("Each field needs to be fulfilled", 409))
  }

  const password = req.body.password
  const letters = password.match(/[A-z]/g)
  const numbers = password.match(/[0-9]/g)
  const specialChars = password.match(/[^A-z0-9\s]/g)

  if (
    password.length >= 8 &&
    letters !== null &&
    numbers !== null &&
    specialChars !== null
  ) {
    next()
  } else {
    next(
      new ErrorHandler(
        "Password needs to have at least 1 special character, 1 number and 1 letter",
        403
      )
    )
  }
}
