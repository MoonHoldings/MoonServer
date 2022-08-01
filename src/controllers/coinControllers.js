const axios = require("axios")
const { doc, getDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")

exports.getCoins = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
  let coinsArr, coinsFormed

  const coinRef = await doc(db, "coins", "supported_coins")
  const coinSnap = await getDoc(coinRef)

  if (coinSnap.exists()) {
    const supportedCoins = coinSnap.data().coins
    const coinIds = supportedCoins.join(",")

    coinsArr = await axios.get(
      `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${coinIds}&interval=1h,1d,7d,30d&per-page=100&page=1&sort=first_priced_at`
    )
  } else {
    next(new ErrorHandler("Coins not found", 404))
  }

  coinsFormed = coinsArr.data.map(coin=>({
    "id": coin.id,
    "currency": coin.currency,
    "symbol": coin.symbol,
    "name": coin.name,
    "logo_url": coin.logo_url,
    "price": coin.price,
    "circulating_supply": coin.circulating_supply,
    "1d_change": coin["1d"]["price_change_pct"],
    "30d_change": coin["30d"]["price_change_pct"],
  }))
  res.json({
    success: true,
    coins: coinsFormed,
  })
})
