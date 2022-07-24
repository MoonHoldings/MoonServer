const express = require("express")
const { getCoins } = require("../controllers/coinController")
const router = express.Router()

router.route("/coins").get(getCoins)

module.exports = router
