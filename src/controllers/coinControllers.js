const axios = require("axios")
const {
  doc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
} = require("firebase/firestore")
const { db, Users } = require("../config/firebase")
const asyncErrorHandler = require("../middlewares/asyncErrorHandler")

exports.saveAllCoins = asyncErrorHandler(async (req, res, next) => {
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

  const coinRef = await doc(db, "coins", "all_coins")
  await setDoc(coinRef, { coins: coinsArr }, { merge: true })

  res.status(200).json({ success: true })
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

  res.status(200).json({
    success: true,
  })
})
