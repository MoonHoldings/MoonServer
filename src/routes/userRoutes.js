const express = require("express")
const passport = require("passport")
const {
  registerUser,
  loginUser,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userControllers")
const checkAuth = require("../middlewares/checkAuth")
const checkNotAuth = require("../middlewares/checkNotAuth")
const usernameGenerator = require("../utils/usernameGenerator")
const router = express.Router()
router.get("/username", async (req, res) => {
  const answer = await usernameGenerator()
  res.json({
    user: answer,
  })
})

router.route("/register").post(registerUser)

router.route("/login").post(passport.authenticate("local"), loginUser)

router.route("/password/update").put(checkAuth, updatePassword)

router.route("/password/forgot-password").post(checkNotAuth, forgotPassword)

router.route("/password/reset/:token").put(checkNotAuth, resetPassword)

router.route("/logout").delete(logout)

// For discord authentication
router.get("/auth/discord", passport.authenticate("discord"))
router.get(
  "/auth/discord/redirect",
  passport.authenticate("discord"),
  (req, res) => {
    res.json({
      user: req.user,
    })
  }
)

// For Twitter authentication
router.get("/auth/twitter", passport.authenticate("twitter"))
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter"),
  (req, res) => {
    res.send({
      user: req.user,
    })
  }
)

module.exports = router
