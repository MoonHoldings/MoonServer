const express = require("express")
const passport = require("passport")
const {
  deleteUserAccount,
  registerUser,
  confirmedEmail,
  getUser,
  loginUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  saveNewPassword,
  logout,
  inviteTester,
  countBeta,
  countNetwork,
  countUsers,
  sendNewsletter,
  getHistory,
} = require("../controllers/userControllers")
const validatePassword = require("../middlewares/validatePassword")
const router = express.Router()

router.route("/register").post(validatePassword, registerUser)

router.route("/confirm-email/confirm-token/:token").get(confirmedEmail)

router.route("/get-user").get(getUser)

router.route("/login").post(loginUser)

router.route("/password/update").put(updatePassword)

router.route("/password/forgot-password").post(forgotPassword)

router.route("/password/reset/:token").get(resetPassword)

router.route("/password/reset/new-password").put(saveNewPassword)

router.route("/logout").delete(logout)

router.route("/invite").post(inviteTester)

// ? Admin
router.route("/count-beta-testers").get(countBeta) // curl http://localhost:9000/api/count-beta-testers

router.route("/count-network").get(countNetwork) // curl "http://localhost:9000/api/count-network"

router.route("/count-users").get(countUsers) // curl "http://localhost:9000/api/count-users"

router.route("/send-newsletter").post(sendNewsletter)

router.route("/get-history").get(getHistory)

router.route("/delete-user-account").post(deleteUserAccount)

router.get("/auth/discord", passport.authenticate("discord"))
router.get(
  "/auth/discord/redirect",
  passport.authenticate("discord", {
    failureRedirect: `${process.env.FE_REDIRECT}/login`,
  }),
  (req, res) => {
    // res.redirect(`${process.env.FE_REDIRECT}/crypto-portfolio`)
    res.redirect("https://www.google.com")
  }
)

router.get("/auth/twitter", passport.authenticate("twitter"))
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: `${process.env.FE_REDIRECT}/login`,
  }),
  (req, res) => {
    res.redirect(`${process.env.FE_REDIRECT}/crypto-portfolio`)
  }
)

module.exports = router
