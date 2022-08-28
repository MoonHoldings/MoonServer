const express = require("express")
const { saveAllCoins } = require("../controllers/coinControllers")
const router = express.Router()

router.route("/save-coins").get(saveAllCoins)

module.exports = router
