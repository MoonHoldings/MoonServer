const axios = require("axios")
const { doc, getDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")

exports.getCoins = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
  let coinsArr

  const docRef = await doc(db, "coins", "supported_coins")
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const supportedCoins = docSnap.data().coins
    const coinsText = supportedCoins.join(",")

    coinsArr = await axios.get(
      `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${coinsText}&interval=1h,1d,7d,30d&per-page=100&page=1&sort=first_priced_at`
    )
  } else {
    next(new ErrorHandler("Coins not found", 404))
  }
  res.json({
    success: true,
    coins: coinsArr.data,
  })
})
