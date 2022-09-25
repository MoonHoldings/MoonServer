const express = require("express")
const passport = require("passport")
// const cors = require("cors")
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  confirmEmail,
  confirmedEmail,
  inviteTester,
  countBeta,
  sendNewsletter,
} = require("../controllers/userControllers")
const checkAuth = require("../middlewares/checkAuth")
const checkNotAuth = require("../middlewares/checkNotAuth")
const validatePassword = require("../middlewares/validatePassword")
const router = express.Router()

// const corsOptions = require("../constants/config")

router.route("/register").post(validatePassword, registerUser)

router.route("/confirm-email").post(checkAuth, confirmEmail)

router.route("/confirm-email/confirm-token/:token").put(confirmedEmail)

router.route("/login").post(passport.authenticate("local"), loginUser)

router.route("/password/update").put(checkAuth, updatePassword)

router.route("/password/forgot-password").post(checkNotAuth, forgotPassword)

router.route("/password/reset/:token").put(checkNotAuth, resetPassword)

router.route("/logout").delete(logout)

router.route("/invite").post(inviteTester)

router.route("/count-beta-testers").get(countBeta)

router.route("/send-newsletter").post(sendNewsletter)

// For discord authentication
router.get("/auth/discord", passport.authenticate("discord"))
router.get(
  "/auth/discord/redirect",
  passport.authenticate("discord", {
    successRedirect: `${process.env.FE_REDIRECT}`,
    failureRedirect: `${process.env.FE_REDIRECT}/login`,
  }),
  (req, res) => {
    res.json({
      success: true,
    })
  }
)

// For Twitter authentication
router.get("/auth/twitter", passport.authenticate("twitter"))
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: `${process.env.FE_REDIRECT}`,
    failureRedirect: `${process.env.FE_REDIRECT}/login`,
  }),
  (req, res) => {
    res.json({
      success: true,
    })
  }
)

module.exports = router
