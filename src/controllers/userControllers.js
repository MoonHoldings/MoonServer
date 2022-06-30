const { addDoc, query, where, getDocs, getDoc } = require("firebase/firestore")
const { Users } = require("../config/firebase")
const bcrypt = require("bcrypt")

const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")
const passport = require("passport")

// Register a user
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  // ----- Check if the email is associated to an existing account -----
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return next(new ErrorHandler("Each field needs to be fulfilled", 409))
  }
  const q = query(Users, where("email", "==", email))
  const qSnapshot = await getDocs(q)
  if (qSnapshot.docs.length !== 0) {
    return next(
      new ErrorHandler("An account is associated with this email", 409)
    )
  } else {
    // ------- save user info for registering -------
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    // Add a user document
    const docRef = await addDoc(Users, {
      strategy: "local",
      username,
      email,
      password: hashedPassword,
    })
    const userSnap = await getDoc(docRef)

    passport.authenticate("local")(req, res, () => {
      res.status(200).json({
        success: true,
        user: userSnap.data(),
      })
    })
  }

  res.status(200)
})

// Login user
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
  })
})

exports.logout = asyncErrorHandler(async (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      next(new ErrorHandler("Logout Error", 401))
    }
  })

  res.status(200).json({
    success: true,
  })
})
