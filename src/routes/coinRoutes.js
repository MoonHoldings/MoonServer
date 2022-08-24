const express = require("express")
const { getCoins2DB } = require("../controllers/coinControllers")
const router = express.Router()

router.route("/coins-to-db").get(getCoins2DB)

module.exports = router
