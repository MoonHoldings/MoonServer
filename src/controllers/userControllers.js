const {
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
} = require("firebase/firestore")
const bcrypt = require("bcrypt")
const passport = require("passport")
const crypto = require("crypto")

const { Users, db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")
const sendResetToken = require("../utils/sendResetToken")
const sendEmail = require("../utils/sendEmail")

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

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const q = query(Users, where("email", "==", req.body.email))
  const docSnap = await getDocs(q)

  if (docSnap.docs.length === 0) {
    return next(new ErrorHandler("User not found", 404))
  }

  // Get Reset Password Token
  const resetToken = sendResetToken(docSnap.docs[0].id)

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`

  const message = `Your password reset token is \n\n${resetPasswordUrl}\n\nIf you did not request this email then please ignore it`

  try {
    await sendEmail({
      email: docSnap.docs[0].data().email,
      subject: "Password Recovery",
      message,
    })

    res.status(200).json({
      success: true,
      message: `Email sent to ${docSnap.docs[0].data().email} successfully`,
    })
  } catch (error) {
    await setDoc(doc(db, "users", docSnap.docs[0].id), {
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    })

    return next(new ErrorHandler(error.message, 500))
  }
})

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const q = query(
    Users,
    where("resetPasswordToken", "==", resetPasswordToken),
    where("resetPasswordExpire", ">", Date.now())
  )
  const docSnap = await getDocs(q)

  if (docSnap.docs.length === 0) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    )
  }

  const newPassword = req.body.password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  await setDoc(doc(db, "users", docSnap.docs[0].id), {
    password: hashedNewPassword,
    resetPasswordToken: undefined,
    resetPasswordExpire: undefined,
  })

  passport.authenticate("local")(req, res, () => {
    res.status(200).json({
      success: true,
      user: docSnap.docs[0].data(),
    })
  })
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
