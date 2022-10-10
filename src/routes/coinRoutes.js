const express = require("express")
const {
  saveAllCoins,
  getCoins,
  saveCoin,
  updateCoin,
} = require("../controllers/coinControllers")
const checkAuth = require("../middlewares/checkAuth")
const { route } = require("./userRoutes")
const router = express.Router()

router.route("/save-coins").get(saveAllCoins)

router.route("/portfolio-coins").get(checkAuth, getCoins)

router.route("/save-coin").put(saveCoin)

router.route("/update-coin").put(updateCoin)

module.exports = router
