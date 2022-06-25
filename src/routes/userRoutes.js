const express = require("express");
const passport = require("passport");
const { registerUser, loginUser } = require("../controllers/userControllers");
const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.get("/auth/discord", passport.authenticate("discord"), (req, res) => {
  res.send(200);
});
router.get(
  "/auth/discord/redirect",
  passport.authenticate("discord"),
  (req, res) => {
    res.send(200);
  }
);

module.exports = router;
