const {
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} = require("firebase/firestore")
const { Historical, db } = require("../config/firebase")

module.exports = async (email, userId, cryptoCoins, isLogin = undefined) => {
  const jsTimeDate = new Date()
  const utc_date = jsTimeDate.getUTCDate()
  const utc_monthNum = jsTimeDate.getUTCMonth()
  const utc_year = jsTimeDate.getUTCFullYear()

  const utc_formedDate = `${utc_monthNum + 1}-${utc_date}-${utc_year}`

  try {
    const todayCoins = []
    let historyCoins

    const q = query(Historical, where("email", "==", email))
    const qSnapshot = await getDocs(q)

    const hRef = await doc(db, "historical", userId)

    if (qSnapshot.docs.length === 0) {
      if (cryptoCoins.length === 0) {
        await setDoc(hRef, {
          email,
          coins_history: [],
          nft_history: [],
        })
      } else {
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
              date: utc_formedDate,
              coins: todayCoins,
            },
          ],
          nft_history: [],
        })
      }
    } else {
      if (isLogin === true) return { success: true }

      historyCoins = qSnapshot.docs[0].data().coins_history

      const todayHistoryIndex = historyCoins.findIndex(
        (coinObj) => coinObj.date === utc_formedDate
      )

      const mappedCryptoCoins = cryptoCoins.map((coin) => ({
        id: coin.id,
        holdings: coin.totalHoldings,
      }))

      if (todayHistoryIndex !== -1) {
        historyCoins[todayHistoryIndex].coins = mappedCryptoCoins
      } else {
        historyCoins.push({
          date: utc_formedDate,
          coins: mappedCryptoCoins,
        })
      }

      await updateDoc(hRef, {
        coins_history: historyCoins,
      })
    }

    return {
      success: true,
      message: "History saved successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    }
  }
}
