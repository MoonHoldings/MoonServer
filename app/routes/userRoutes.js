const express = require("express");
const passport = require("passport");
const { registerUser } = require("../controllers/userControllers");
const router = express.Router();

router.route("/register").post(passport.authenticate("discord"), registerUser);

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
