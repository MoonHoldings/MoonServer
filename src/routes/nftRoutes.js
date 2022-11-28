const express = require("express")
const { nftCollections } = require("../controllers/nftControllers")
const router = express.Router()

router.route("/nft-collections").get(nftCollections)

module.exports = router
