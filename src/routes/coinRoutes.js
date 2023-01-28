const express = require("express")
const {
  saveAllCoins,
  saveCoin,
  removeCoin,
  updateCoin,
  getACoin,
  coinHistory,
  refreshCoins,
} = require("../controllers/coinControllers")
const router = express.Router()

router.route("/save-coins").get(saveAllCoins) //cron job

// router.route("/portfolio-coins").get(checkAuth, getCoins)

router.route("/save-coin").put(saveCoin)

router.route("/update-coin").put(updateCoin)

router.route("/remove-coin").put(removeCoin)

router.route("/get-coin").post(getACoin)

router.route("/coin-history").post(coinHistory)

router.route("/refresh-coins").post(refreshCoins)

module.exports = router
