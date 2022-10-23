const express = require("express")
const {
  saveAllCoins,
  getCoins,
  saveCoin,
  updateCoin,
  removeCoin,
} = require("../controllers/coinControllers")
const authenticateToken = require("../middlewares/authenticateToken")
const checkAuth = require("../middlewares/checkAuth")
const { route } = require("./userRoutes")
const router = express.Router()

router.route("/save-coins").get(saveAllCoins) //cron job

// router.route("/portfolio-coins").get(checkAuth, getCoins)

router.route("/save-coin").put(authenticateToken, saveCoin)

router.route("/update-coin").put(authenticateToken, updateCoin)

router.route("/remove-coin").put(authenticateToken, removeCoin)

module.exports = router
