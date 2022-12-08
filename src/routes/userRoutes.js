const express = require("express")
const passport = require("passport")
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  saveNewPassword,
  confirmedEmail,
  inviteTester,
  countBeta,
  countNetwork,
  countUsers,
  sendNewsletter,
  getHistory,
  deleteUserAccount,
} = require("../controllers/userControllers")
const authenticateToken = require("../middlewares/authenticateToken")
const checkAuth = require("../middlewares/checkAuth")
const checkNotAuth = require("../middlewares/checkNotAuth")
const validatePassword = require("../middlewares/validatePassword")
const router = express.Router()

router.route("/register").post(validatePassword, registerUser)

// router.route("/confirm-email").post(checkAuth, confirmEmail)

router.route("/confirm-email/confirm-token/:token").get(confirmedEmail)

router.route("/login").post(loginUser)
// router.route("/login").post(passport.authenticate("local"), loginUser)

router.route("/password/update").put(authenticateToken, updatePassword)

router.route("/password/forgot-password").post(forgotPassword)

router.route("/password/reset/:token").get(resetPassword)

router.route("/password/reset/new-password").put(saveNewPassword)

router.route("/logout").delete(authenticateToken, logout)

router.route("/invite").post(inviteTester)

// ? Admin
router.route("/count-beta-testers").get(countBeta) // curl http://localhost:9000/api/count-beta-testers

router.route("/count-network").get(countNetwork) // curl "http://localhost:9000/api/count-network"

router.route("/count-users").get(countUsers) // curl "http://localhost:9000/api/count-users"

router.route("/send-newsletter").post(sendNewsletter)

router.route("/get-history").get(authenticateToken, getHistory)

router.route("/delete-user-account").post(authenticateToken, deleteUserAccount)

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
