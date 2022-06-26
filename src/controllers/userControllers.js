const { addDoc, query, where, getDocs } = require("firebase/firestore")
const { Users } = require("../config/firebase")
const bcrypt = require("bcrypt")

const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")
// const passport = require("passport");

// Register a user
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  // ----- Check if the email is associated to an existing account -----
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return next(new ErrorHandler("Each field needs to be fulfilled", 401))
  }
  const q = query(Users, where("email", "==", email))
  const qSnapshot = await getDocs(q)
  if (qSnapshot.docs.length !== 0) {
    next(new ErrorHandler("An account is associated with this email", 409))
  } else {
    // ------- save user info for registering -------
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    // Add a user document
    const docRef = await addDoc(Users, {
      username,
      email,
      password: hashedPassword,
    })

    res.status(200).json({
      success: true,
      user_id: docRef.id,
    })
  }

  res.status(200)
})

// Login user
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  console.log("Logged In")
  res.send(200)
})
/*
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      next(new ErrorHandler("error: " + info.message, 401));
    }
    if (!user) {
      next(new ErrorHandler("error: " + info.message, 401));
    }
    req.logIn(user, (err) => {
      if (err) {
        next(new ErrorHandler("error: " + err.message, 401));
      }

      return res.status(200).json({
        success: true,
      });
    });
  })(req, res, next);
});
*/
