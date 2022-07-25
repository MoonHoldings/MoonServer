const express = require("express")
const { getCoins } = require("../controllers/coinControllers")
const router = express.Router()

router.route("/coins").get(getCoins)

module.exports = router
