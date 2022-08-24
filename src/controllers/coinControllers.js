const axios = require("axios")
const { doc, setDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")

exports.getCoins2DB = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
  let coinsArr = []

  for (let i = 0; i < 5; i++) {
    const response = await axios.get(
      `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&interval=1d,30d&per-page=100&page=${
        i + 1
      }&sort=rank`
    )

    response.data.forEach((coin) => {
      const coinObj = {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        logo_url: coin.logo_url,
      }

      coinsArr.push(coinObj)
    })
  }

  const coinRef = await doc(db, "coins", "top_500")
  await setDoc(coinRef, { coins: coinsArr }, { merge: true })

  res.status(200).json({ success: true })
})

exports.getCoin = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
})

// curl "https://api.nomics.com/v1/currencies/ticker?key=ee97b194f4a7d1f404c52aceee2a4c6b4464b970&interval=1h,1d,7d,30d&per-page=1&page=1&sort=rank"

// curl "https://api.nomics.com/v1/currencies/highlights?key=ee97b194f4a7d1f404c52aceee2a4c6b4464b970&currency=BTC"
