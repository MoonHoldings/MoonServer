const axios = require("axios")
const {
  doc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
} = require("firebase/firestore")
const { db, Users } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")
const addHistoricalCoin = require("../utils/addHistoricalCoin")
const ErrorHandler = require("../utils/errorHandler")
const getCoinHistory = require("../utils/getCoinHistory")

exports.saveAllCoins = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
  let coinsArr = []

  for (let i = 0; i < 10; i++) {
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

  // extra supported coins array
  const extra_coins = []
  const extraRef = await doc(db, "coins", "more_coins")
  const extraSnap = await getDoc(extraRef)

  if (extraSnap.exists()) {
    extraSnap.data().coins.forEach((coin) => {
      const doesExist = coinsArr.some((c) => c.id === coin)
      if (!doesExist) {
        extra_coins.push(coin)
      }
    })
  }

  ////////////////// getting coins from nomics
  const allIds = extra_coins.join(",")
  const response = await axios.get(
    `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${allIds}&per-page=100&page=1`
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

  const coinRef = await doc(db, "coins", "all_coins")
  await setDoc(coinRef, { coins: coinsArr }, { merge: true })

  res.status(200).json({
    success: true,
    coinNum: coinsArr.length,
    extra: extraSnap.data().coins.length,
  })
})

exports.getCoins = asyncErrorHandler(async (req, res, next) => {
  const q = query(Users, where("email", "==", req.user.email))
  const qSnapshot = await getDocs(q)

  if (qSnapshot.docs.length === 0) {
    return next("No account found", 401)
  }

  res.status(200).json({
    success: true,
    coins: qSnapshot.docs[0].data().portfolio.coins,
  })
})

exports.saveCoin = asyncErrorHandler(async (req, res, next) => {
  const coin = req.body.coin

  const q = query(Users, where("email", "==", req.body.email))
  const qSnapshot = await getDocs(q)

  if (qSnapshot.docs.length === 0) {
    return next("No account found", 401)
  }

  const theUser = qSnapshot.docs[0].data()
  theUser.portfolio.coins.push(coin)

  const docRef = await doc(db, "users", qSnapshot.docs[0].id)
  await updateDoc(docRef, {
    portfolio: theUser.portfolio,
  })

  const historyResult = await addHistoricalCoin(
    req.body.email,
    qSnapshot.docs[0].id,
    theUser.portfolio.coins
  )

  if (!historyResult.success) {
    next(new ErrorHandler(historyResult.message, 500))
  }

  res.status(200).json({
    success: true,
  })
})

exports.updateCoin = asyncErrorHandler(async (req, res, next) => {
  const coin = req.body.coin

  const q = query(Users, where("email", "==", req.body.email))
  const qSnapshot = await getDocs(q)

  if (qSnapshot.docs.length === 0) {
    return next("No account found", 401)
  }

  const theUser = qSnapshot.docs[0].data()
  const coinIndex = theUser.portfolio.coins.findIndex((c) => c.id === coin.id)

  theUser.portfolio.coins[coinIndex] = coin

  const docRef = await doc(db, "users", qSnapshot.docs[0].id)
  await updateDoc(docRef, {
    portfolio: theUser.portfolio,
  })

  const historyResult = await addHistoricalCoin(
    req.body.email,
    qSnapshot.docs[0].id,
    theUser.portfolio.coins
  )

  if (!historyResult.success) {
    return next(new ErrorHandler(historyResult.message, 500))
  }

  res.status(200).json({
    success: true,
  })
})

exports.removeCoin = asyncErrorHandler(async (req, res, next) => {
  const coinId = req.body.coinId

  const q = query(Users, where("email", "==", req.body.email))
  const qSnapshot = await getDocs(q)

  if (qSnapshot.docs.length === 0) {
    return next("No account found", 401)
  }

  const theUser = qSnapshot.docs[0].data()
  const coinIndex = theUser.portfolio.coins.findIndex((c) => c.id === coinId)
  theUser.portfolio.coins.splice(coinIndex, 1)

  const docRef = await doc(db, "users", qSnapshot.docs[0].id)
  await updateDoc(docRef, {
    portfolio: theUser.portfolio,
  })

  const historyResult = await addHistoricalCoin(
    req.body.email,
    qSnapshot.docs[0].id,
    theUser.portfolio.coins
  )

  if (!historyResult.success) {
    return next(new ErrorHandler(historyResult.message, 500))
  }

  res.status(200).json({
    success: true,
  })
})

exports.getACoin = asyncErrorHandler(async (req, res, next) => {
  const NOMICS_KEY = process.env.NOMICS_KEY
  const coinId = req.body.coinId

  const response = await axios.get(
    `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${coinId}&intervals=1d,30d`
  )

  const coin = response.data[0]

  res.status(200).json({
    success: true,
    coin,
  })
})

exports.coinHistory = asyncErrorHandler(async (req, res, next) => {
  const historicalData = req.body.historicalData
  const email = req.body.email

  const coinData = await getCoinHistory(historicalData, email)

  res.status(200).json({
    success: true,
    coinHistoryData: coinData,
  })
})
