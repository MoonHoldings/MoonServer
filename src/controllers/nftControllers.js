const axios = require("axios")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")

const SHYFT_URL = process.env.SHYFT_URL
const SHYFT_KEY = process.env.SHYFT_KEY

exports.nftCollections = asyncErrorHandler(async (req, res, next) => {
  const walletAddress = req.body.walletAddress

  const response = await axios.get(
    `${SHYFT_URL}/wallet/collections?network=mainnet-beta&wallet_address=${walletAddress}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SHYFT_KEY,
      },
    }
  )

  const result = await response.data

  const collections = result.result.collections.map((col) => col)

  res.status(200).json({ collections: collections })
})
