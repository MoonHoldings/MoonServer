const axios = require("axios")

const NOMICS_KEY = process.env.NOMICS_KEY
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const dateInMS = 86400000
const presentDayMS = Date.now()

// * Combines Promises and returns responses together. (Util)
const fetchAllPromises = () => Promise.all(array)

module.exports = async (historicalData, email) => {
  const historyValues = []
  const dateLabels = []

  const userHistoriesObj = historicalData.find(
    (history) => history.email === email
  )
  const weekInMS = []

  //populate dateLabels
  for (let i = 0; i < 7; i++) {
    const dateMS = presentDayMS - dateInMS * (7 - i)
    const dateJS = new Date(dateMS)
    const dayNum = dateJS.getDay()
    const day = days[dayNum]
    const date = dateJS.getDate()

    dateLabels[i] = `${day} ${date}`
    weekInMS[i] = dateMS
  }

  const _7dHistories = []
  // populate indexes where weekInMS[i] matches
  for (let i = 0; i < weekInMS.length; i++) {
    const labelDate = dateForming(weekInMS[i])

    const foundHistory = userHistoriesObj?.coins_history?.find(
      (history) => history.date === labelDate
    )
    if (foundHistory) {
      _7dHistories[i] = {
        coins: foundHistory.coins,
        date: foundHistory.date,
      }
    } else {
      _7dHistories[i] = undefined
    }
  }

  if (_7dHistories[0] === undefined) {
  }

  // if _7dHistories[0] doesn't exist, go backward by subtracting dateInMS
  let leastGap0 = 0
  let the0History
  if (_7dHistories[0] === undefined) {
    if (userHistoriesObj.coins_history.length !== 0) {
      for (let i = 0; i < userHistoriesObj.coins_history.length; i++) {
        const singleHistory = userHistoriesObj.coins_history[i]

        const singleHistoryDateMS = new Date(singleHistory.date).getTime()

        const subtract = weekInMS[0] - singleHistoryDateMS

        if (i === 0 && subtract > 0) {
          leastGap0 = subtract
          the0History = singleHistory
        }

        if (
          i !== 0 &&
          singleHistoryDateMS < weekInMS[0] &&
          subtract > 0 &&
          subtract < leastGap0
        ) {
          leastGap0 = subtract
          the0History = singleHistory
        }
      }
      _7dHistories[0] = the0History

      if (the0History === undefined) _7dHistories[0] = 0
    } else {
      _7dHistories[0] = 0
    }
  }

  // if any index is undefined then populate with the previous value
  for (let i = 0; i < _7dHistories.length; i++) {
    if (i !== 0 && _7dHistories[i] === undefined) {
      _7dHistories[i] = _7dHistories[i - 1]
    }
  }

  // get coins from 7dHistories
  const allCoins = []
  _7dHistories.forEach((d) => {
    if (d !== 0) {
      for (let i = 0; i < d.coins.length; i++) {
        const record = allCoins.find((coin) => coin.id === d.coins[i].id)

        if (!record) allCoins.push(d.coins[i])
      }
    }
  })

  let coinsPrices = []

  const results = await Promise.all(
    allCoins.map((coin) => {
      return new Promise((resolve, reject) => {
        axios
          .get(
            `https://api.nomics.com/v1/candles?key=${NOMICS_KEY}&interval=1d&currency=${
              coin.id
            }&start=${getISOFormat(weekInMS[0])}&end=${getISOFormat(
              weekInMS[weekInMS.length - 1]
            )}`
          )
          .then((response) => {
            const candles = response.data.map((c) => c.close)

            resolve({ id: coin.id, candles })
          })
      })
    })
  )

  allCoins.forEach((coin) => {
    const singleCoinPrices = results.find((result) => result.id === coin.id)
    if (singleCoinPrices)
      coinsPrices.push({
        id: coin.id,
        _7dPrices: singleCoinPrices.candles,
      })
  })

  _7dHistories.forEach((day, dayIndex) => {
    if (day !== 0) {
      let valueSum = 0
      for (let i = 0; i < day.coins.length; i++) {
        const candleCoin = coinsPrices.find((c) => c.id === day.coins[i].id)

        const totalValue =
          day.coins[i].holdings * candleCoin._7dPrices[dayIndex]

        valueSum += totalValue
      }

      historyValues.push(valueSum)
    } else {
      historyValues.push(day)
    }
  })

  return {
    dateLabels,
    historyValues,
  }
}

const getISOFormat = (cMS) => {
  const c_iso_date = new Date(cMS)
  const c_year = c_iso_date.getFullYear()
  const c_month = c_iso_date.getMonth()
  const c_date = c_iso_date.getDate()

  return `${c_year}-${c_month + 1 > 9 ? c_month + 1 : "0" + (c_month + 1)}-${
    c_date > 9 ? c_date : "0" + c_date
  }T00:00:00Z`
}

const dateForming = (toBeFormedMS) => {
  const df_dateJS = new Date(toBeFormedMS)
  const df_month = df_dateJS.getMonth()
  const df_date = df_dateJS.getDate()
  const df_year = df_dateJS.getFullYear()

  return `${df_month + 1}-${df_date}-${df_year}`
}
