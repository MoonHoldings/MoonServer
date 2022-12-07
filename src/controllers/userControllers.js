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
  setDoc,
} = require("firebase/firestore")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const sgMail = require("@sendgrid/mail")
const jwt = require("jsonwebtoken")

const {
  Users,
  BetaTesters,
  InvestorNetwork,
  TestNetwork,
  db,
  Historical,
} = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")
const sendResetToken = require("../utils/sendResetToken")
const usernameGenerator = require("../utils/usernameGenerator")
const sendConfirmToken = require("../utils/sendConfirmToken")
const sendConfirmEmail = require("../utils/sendConfirmEmail")
const addHistoricalCoin = require("../utils/addHistoricalCoin")

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
      portfolioStyle: "grid",
      currency: "usd",
      activity: {
        visits: 0,
        streaks: {
          _5days: 0,
          _30days: 0,
          _100days: 0,
        },
      },
      portfolio: {
        coins: [],
        nfts: [],
      },
    })
    /*
    coins: [
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        wallets: [
          {
            name: 'Coinbase',
            balance: 0
          }
        ]
      }
    ]
     */

    // Confirm Email after signup
    await sendConfirmEmail(req, docRef, sgMail, email, username)

    console.log("signed up user", docRef.id)
    res.status(200).json({
      success: true,
      message: `Email sent to ${email} successfully`,
    })
  }
})

// Confirm Email after signup

exports.confirmedEmail = asyncErrorHandler(async (req, res, next) => {
  const token = req.params.token
  const confirmEmailToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const q = await query(Users, where("confirm", "==", confirmEmailToken))
  const docSnap = await getDocs(q)

  if (
    docSnap.docs.length === 0 ||
    docSnap.docs[0].data().confirmEmailExpire <= Date.now()
  ) {
    return res.redirect(process.env.FE_REDIRECT + `/login?error=expired`)
  }

  const userRef = await doc(db, "users", docSnap.docs[0].id)
  await updateDoc(userRef, {
    confirm: "confirm",
    confirmEmailExpire: "",
  })
  return res.status(200).redirect(process.env.FE_REDIRECT + "/login")
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

  sgMail.setApiKey(process.env.SENDGRID_KEY)

  try {
    const mail = {
      to: req.body.email,
      from: {
        email: process.env.SG_SENDER,
        name: "MoonHoldings.xyz",
      },
      subject: "Reset Password",
      text: message,
    }
    await sgMail.send(mail)

    res.status(200).json({
      success: true,
      message: `An email sent to ${docSnap.docs[0].data().email} !`,
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
  } else {
    res
      .status(200)
      .redirect(
        `${process.env.FE_REDIRECT}/reset-password?token=${req.params.token}`
      )
  }
})

// save new password
exports.saveNewPassword = asyncErrorHandler(async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(req.body.token)
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

  const userRef = await doc(db, "users", docSnap.docs[0].id)
  await updateDoc(userRef, {
    confirm: "confirm",
    password: hashedNewPassword,
    resetPasswordToken: deleteField(),
    resetPasswordExpire: deleteField(),
  })

  const newDocSnap = await getDoc(userRef)

  res.status(200).json({
    success: true,
    user: newDocSnap.data(),
  })
})

// Login user
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return next(new ErrorHandler("Every field needs to be fulfilled", 400))
  }

  const q = query(
    Users,
    where("email", "==", email),
    where("strategy", "==", "local")
  )
  const qSnapshot = await getDocs(q)

  if (qSnapshot.docs.length === 0) {
    return next(
      new ErrorHandler("There is no account associated to this email", 401)
    )
  }

  const user = await qSnapshot.docs[0].data()
  const isValid = await bcrypt.compare(password, user.password)

  if (isValid) {
    const accessToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        confirm: user.confirm,
        createdAt: user.createdAt,
        portfolioStyle: user.portfolioStyle,
        currency: user.currency,
        activity: user.activity,
        portfolio: user.portfolio,
      },
      process.env.JWT_SECRET
    )

    // if this person doesn't have historical object in historical collection, this will add historical data for this person [when logging in]
    const historyResult = await addHistoricalCoin(
      user.email,
      qSnapshot.docs[0].id,
      user.portfolio.coins,
      true
    )
    if (!historyResult.success) {
      return next(new ErrorHandler(historyResult.message, 500))
    }

    console.log("logged in user", qSnapshot.docs[0].id)
    return res.status(200).json({
      success: true,
      accessToken,
    })
  } else {
    res.status(401).json({
      success: false,
    })
  }
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

// invite beta tester
exports.inviteTester = asyncErrorHandler(async (req, res, next) => {
  const q = await query(BetaTesters, where("email", "==", req.body.email))
  const docSnap = await getDocs(q)

  if (docSnap.docs.length !== 0) {
    return next(new ErrorHandler("You are already invited", 409))
  }

  try {
    const testerRef = await doc(db, "betaTesters", req.body.email)
    await setDoc(testerRef, {
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
      subscription: req.body.subscription,
    })
  } catch (error) {
    return next(new ErrorHandler(error.message, 409))
  }

  sgMail.setApiKey(process.env.SENDGRID_KEY)

  const mail = {
    to: req.body.email,
    from: {
      email: process.env.SG_SENDER,
      name: "MoonHoldings.xyz",
    },
    subject: "MoonHoldings Beta Invite",
    html: `
    <h2>Hello ${req.body.name}</h2>
    <p>Thanks for signing up to get notified about the MoonHoldings Beta, we will email you again when it's time to sign up!</p><br/>
    <p>You can reply to this email, I will read it and respond if needed :) - Leon</p><br/>
    `,
  }

  const response = await sgMail.send(mail)

  res.status(200).json({
    success: true,
    message: `Email sent to ${req.body.email} successfully!`,
  })
})

exports.countBeta = asyncErrorHandler(async (req, res, next) => {
  const docSnap = await getDocs(BetaTesters)

  res.json({
    success: true,
    betaTesters: docSnap.docs.length,
  })
})

exports.countNetwork = asyncErrorHandler(async (req, res, next) => {
  const docSnap = await getDocs(InvestorNetwork)

  res.json({
    success: true,
    InvestorNetwork: docSnap.docs.length,
  })
})

exports.countUsers = asyncErrorHandler(async (req, res, next) => {
  const docSnap = await getDocs(Users)

  res.json({
    success: true,
    users: docSnap.docs.length,
  })
})

exports.sendNewsletter = asyncErrorHandler(async (req, res, next) => {
  const investorEmails = []
  const snapshot = await getDocs(BetaTesters)
  snapshot.docs.forEach((doc) => {
    investorEmails.push(doc.data().email)
  })

  sgMail.setApiKey(process.env.SENDGRID_KEY)
  const mail = {
    to: investorEmails,
    from: {
      email: process.env.SG_SENDER,
      name: "MoonHoldings.xyz",
    },
    subject: `${req.body.subject}`,
    html: `${req.body.html}`,
  }

  await sgMail.sendMultiple(mail)

  res.status(200).json({
    success: true,
    message: `Email sent to ${snapshot.docs.length} email addresses.`,
  })
})

exports.getHistory = asyncErrorHandler(async (req, res, next) => {
  const allHistoricalData = []

  const qSnapshot = await getDocs(Historical)

  qSnapshot.docs.forEach((doc) => {
    allHistoricalData.push(doc.data())
  })

  res.status(200).json({
    success: true,
    historicalData: allHistoricalData,
  })
})
