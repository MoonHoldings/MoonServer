const {
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
} = require("firebase/firestore")
const { Historical, db } = require("../config/firebase")

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

module.exports = async (email, userId, cryptoCoins) => {
  const utc_time = new Date()
  const date = utc_time.getUTCDate()
  const monthNum = utc_time.getUTCMonth()
  const month = monthNames[monthNum]
  const year = utc_time.getUTCFullYear()
  const utc_date = `${date} ${month}, ${year}`

  try {
    const todayCoins = []
    let historyCoins

    const q = query(Historical, where("email", "==", email))
    const qSnapshot = await getDocs(q)

    const hRef = await doc(db, "historical", userId)

    if (qSnapshot.docs.length === 0) {
      cryptoCoins.forEach((coin) => {
        todayCoins.push({
          id: coin.id,
          holdings: coin.totalHoldings,
        })
      })

      await setDoc(hRef, {
        email,
        coins_history: [
          {
            date: utc_date,
            coins: todayCoins,
          },
        ],
        nft_history: [],
      })
    } else {
      historyCoins = qSnapshot.docs[0].data().coins_history

      const todayHistory = historyCoins.find(
        (coinObj) => coinObj.date === utc_date
      )
      const todayHistoryIndex = historyCoins.findIndex(
        (coinObj) => coinObj.date === utc_date
      )

      const mappedCryptoCoins = cryptoCoins.map((coin) => ({
        id: coin.id,
        holdings: coin.totalHoldings,
      }))

      if (todayHistory) {
        historyCoins[todayHistoryIndex].coins = mappedCryptoCoins
      } else {
        historyCoins.push({
          date: utc_date,
          coins: mappedCryptoCoins,
        })
      }

      await updateDoc(hRef, {
        coins_history: historyCoins,
      })
    }

    return {
      success: true,
      message: "History saved successfully!",
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    }
  }
}
