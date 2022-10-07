const express = require("express")
const { saveAllCoins, saveCoin } = require("../controllers/coinControllers")
const router = express.Router()

router.route("/save-coins").get(saveAllCoins)

router.route("/save-coin").put(saveCoin)

module.exports = router
