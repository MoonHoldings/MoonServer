const {
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
} = require("firebase/firestore")
const { Historical, db } = require("../config/firebase")

module.exports = async (email, userId, cryptoCoins, isLogin = undefined) => {
  const utc_time = new Date()
  const date = utc_time.getUTCDate()
  const monthNum = utc_time.getUTCMonth()
  const year = utc_time.getUTCFullYear()
  const utc_date = `${monthNum + 1}-${date}-${year}`

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
      if (isLogin === true) {
        return {
          success: true,
        }
      }

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
