const {
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteField,
  serverTimestamp,
} = require("firebase/firestore")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const sgMail = require("@sendgrid/mail")

const { Users, db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")
const sendResetToken = require("../utils/sendResetToken")
const sendEmail = require("../utils/sendEmail")
const usernameGenerator = require("../utils/usernameGenerator")
const sendConfirmToken = require("../utils/sendConfirmToken")

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
    const username = await usernameGenerator(email)
    // ------- save user info for registering -------
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    // Add a user document
    const docRef = await addDoc(Users, {
      strategy: "local",
      username,
      email,
      password: hashedPassword,
      confirm: "",
      confirmEmailExpire: null,
      createdAt: serverTimestamp(),
    })

    res.status(200).json({
      success: true,
      userId: docRef.id,
    })
  }
})

// Confirm Email after signup
exports.confirmEmail = asyncErrorHandler(async (req, res, next) => {
  const q = query(Users, where("email", "==", req.user.email))
  const docSnap = await getDocs(q)

  if (docSnap.docs.length === 0) {
    return next(new ErrorHandler("User not found", 404))
  }

  // Get Confirm Email Token
  const confirmToken = await sendConfirmToken(docSnap.docs[0].id)

  const confirmTokenUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/confirm-email/confirm-token/${confirmToken}`

  sgMail.setApiKey(process.env.SENDGRID_KEY)
  /* <h1>Hi ${req.user.username}!</h1> */
  const mail = {
    to: req.user.email,
    from: {
      email: process.env.SG_SENDER,
      name: "MoonHoldings.xyz",
    },
    subject: "MoonHoldings Email Confirmation",
    html: `
    <h1>Hello ${req.user.username}!</h1>
    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      Please confirm your email address to complete sign up
    </div>

    <br/><br/>

    <a style="
        text-decoration: none;
        padding: 15px 30px;
        background-color: #13f195;
        border-radius: 3px;
        font-size: 20px;
        font-weight: bold;
        color: #000;
        "
      href="${confirmTokenUrl}"
      target="_blank"
    >
    Confirm your email
    </a>

    <br/><br/>

    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      Thanks!
    </div>

    <br/><br/>

    <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
      The Moon Holdings Team
    </div>
    `,
  }

  const response = await sgMail.send(mail)

  res.status(200).json({
    success: true,
    message: `Email sent to ${docSnap.docs[0].data().email} successfully`,
    response,
  })
})

exports.confirmedEmail = asyncErrorHandler(async (req, res, next) => {
  // Creating token hash
  const confirmEmailToken = await crypto
    .createHash("sha256")
    .upgrade(req.params.token)
    .digest("hex")

  const q = await query(Users, where("confirm", "==", confirmEmailToken))
  const docSnap = await getDocs(q)

  if (
    docSnap.docs.length === 0 ||
    docSnap.docs[0].data().confirmEmailExpire <= Date.now()
  ) {
    return next(
      new ErrorHandler("Confirm Email Link is invalid or has been expired", 400)
    )
  }

  const userRef = await doc(db, "users", docSnap.docs[0].id)
  await updateDoc(userRef, {
    confirm: "confirmed",
    confirmEmailExpire: "",
  })

  res.status(200).json({
    success: true,
  })
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
