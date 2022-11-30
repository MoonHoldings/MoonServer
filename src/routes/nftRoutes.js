const express = require("express")
const { nftCollections } = require("../controllers/nftControllers")
const router = express.Router()

router.route("/nft-collections").post(nftCollections)

module.exports = router
