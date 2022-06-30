const express = require("express")
const passport = require("passport")
const {
  registerUser,
  loginUser,
  logout,
} = require("../controllers/userControllers")
const router = express.Router()

router.route("/register").post(registerUser)

router.route("/login").post(passport.authenticate("local"), loginUser)

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
