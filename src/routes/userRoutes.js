const express = require("express")
const passport = require("passport")
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUser,
} = require("../controllers/userControllers")
const checkAuth = require("../middlewares/checkAuth")
const checkNotAuth = require("../middlewares/checkNotAuth")
const validatePassword = require("../middlewares/validatePassword")
const router = express.Router()

router.route("/getuser").get(getUser)

router.route("/register").post(validatePassword, registerUser)

router.route("/login").post(passport.authenticate("local"), loginUser)

router.route("/password/update").put(checkAuth, updatePassword)

router.route("/password/forgot-password").post(checkNotAuth, forgotPassword)

router.route("/password/reset/:token").put(checkNotAuth, resetPassword)

router.route("/logout").delete(logout)

// For discord authentication
router.get("/auth/discord", passport.authenticate("discord"))
router.get(
  "/auth/discord/redirect",
  passport.authenticate("discord", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000")
  }
)

// For Twitter authentication
router.get("/auth/twitter", passport.authenticate("twitter"))
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000")
  }
)

module.exports = router
