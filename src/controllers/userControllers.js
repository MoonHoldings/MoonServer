const {
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteField,
} = require("firebase/firestore")
const bcrypt = require("bcrypt")
const passport = require("passport")
const crypto = require("crypto")

const { Users, db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")
const sendResetToken = require("../utils/sendResetToken")
const sendEmail = require("../utils/sendEmail")
const usernameGenerator = require("../utils/usernameGenerator")

// Register a user
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  // ----- Check if the email is associated to an existing account -----
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ErrorHandler("Each field needs to be fulfilled", 409))
  }
  const q = query(
    Users,
    where("strategy", "==", "local"),
    where("email", "==", email)
  )
  const qSnapshot = await getDocs(q)
  if (qSnapshot.docs.length !== 0) {
    return next(
      new ErrorHandler("An account is associated with this email", 409)
    )
  } else {
    const username = await usernameGenerator()
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
})

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const oldPassword = req.body.oldPassword
  const newPassword = req.body.newPassword

  const isValid = await bcrypt.compare(oldPassword, req.user.password)

  if (isValid) {
    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    const q = await query(Users, where("email", "==", req.user.email))
    const userSnap = await getDocs(q)
    console.log(userSnap.docs[0].data())
    await updateDoc(doc(db, "users", userSnap.docs[0].id), {
      password: newHashedPassword,
    })
  } else {
    return next(new ErrorHandler("Your present password is incorrect!"))
  }
  res.status(200).json({
    success: true,
    user: req.user,
  })
})

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const q = query(Users, where("email", "==", req.body.email))
  const docSnap = await getDocs(q)

  if (docSnap.docs.length === 0) {
    return next(new ErrorHandler("User not found", 404))
  }

  // Get Reset Password Token
  const resetToken = await sendResetToken(docSnap.docs[0].id)

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`

  const message = `Your password reset token is \n${resetPasswordUrl}\n\nIf you did not request this email then please ignore it`

  try {
    await sendEmail({
      subject: "Password Recovery",
      text: message,
      to: docSnap.docs[0].data().email,
      from: process.env.SMPT_MAIL,
    })

    res.status(200).json({
      success: true,
      message: `Email sent to ${docSnap.docs[0].data().email} successfully`,
    })
  } catch (error) {
    const errDocRef = await doc(db, "users", docSnap.docs[0].id)
    await updateDoc(errDocRef, {
      resetPasswordToken: deleteField(),
      resetPasswordExpire: deleteField(),
    })
    return next(new ErrorHandler("error from here: " + error, 500))
  }
})

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const q = await query(
    Users,
    where("resetPasswordToken", "==", resetPasswordToken)
  )
  const docSnap = await getDocs(q)

  if (
    docSnap.docs.length === 0 ||
    docSnap.docs[0].data().resetPasswordExpire <= Date.now()
  ) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    )
  }

  const newPassword = req.body.password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  const newDocRef = await doc(db, "users", docSnap.docs[0].id)
  await updateDoc(newDocRef, {
    password: hashedNewPassword,
    resetPasswordToken: deleteField(),
    resetPasswordExpire: deleteField(),
  })

  const newDocSnap = await getDoc(newDocRef)

  res.status(200).json({
    success: true,
    user: newDocSnap.data(),
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
