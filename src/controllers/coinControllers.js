const axios = require("axios")
const { doc, getDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const ErrorHandler = require("../utils/errorHandler")

exports.getCoins = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
  // let coinsArr,
  //   coinsFormed = []
  // let coinNum
  let allCoins = []

  // const coinRef = await doc(db, "coins", "supported_coins")
  // const coinSnap = await getDoc(coinRef)

  // const supportedCoins = coinSnap.data().coins

  // const division = supportedCoins.length / 100
  // const modulus = supportedCoins % 100

  // if (modulus !== 0) {
  //   supportedCoinNum = division + 1
  // } else {
  //   supportedCoinNum = division
  // }

  // const coinIds = supportedCoins.join(",")

  for (let i = 0; i < 10; i++) {
    const coinsArr = await axios.get(
      `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&interval=1d,30d&per-page=100&page=${
        i + 1
      }`
    )
    allCoins = [...allCoins, ...coinsArr.data]
  }

  // const coinsArr = await axios.get(
  //   `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&interval=1d,30d&per-page=100&page=1`
  // )
  // const coinsArr = await axios.get(
  //   `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${coinIds}&interval=1d,30d&per-page=100&page=1`
  // )

  res.json({ coins: allCoins.length })

  // if (coinSnap.exists()) {
  // const supportedCoins = coinSnap.data().coins
  // const coinIds = supportedCoins.join(",")

  // for (let i = 0; i < 3; i++) {
  //   coinsArr = await axios.get(
  //     `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&interval=1d,30d&per-page=100&page=${
  //       i + 1
  //     }&sort=rank`
  //   )

  //   coinsArr.data.forEach((coin) => {
  //     const coinObj = {
  //       id: coin.id,
  //       currency: coin.currency,
  //       symbol: coin.symbol,
  //       name: coin.name,
  //       logo_url: coin.logo_url,
  //       price: coin.price,
  //       circulating_supply: coin.circulating_supply,
  //       "1d_change": coin["1d"]["price_change_pct"],
  //       "30d_change": coin["30d"]["price_change_pct"],
  //     }
  //     coinsFormed.push(coinObj)
  //   })
  // }

  // coinsArr = await axios.get(
  //   `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${coinIds}&interval=1h,1d,7d,30d&per-page=200&page=1&sort=first_priced_at`
  // )
  // } else {
  // next(new ErrorHandler("Coins not found", 404))
  // }

  // res.json({
  //   success: true,
  //   coins: coinsFormed,
  // })
})

// https://api.nomics.com/v1/currencies/ticker?key=ee97b194f4a7d1f404c52aceee2a4c6b4464b970&interval=1h,30d&per-page=100&page=1&sort=rank
