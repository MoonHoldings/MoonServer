const {
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
} = require("firebase/firestore")
const { Historical, db } = require("../config/firebase")

module.exports = async (email, userId, cryptoCoins) => {
  const date = new Date().toUTCString()

  try {
    let hRef
    const todayCoins = []

    const q = query(Historical, where("email", "==", email))
    const qSnapshot = await getDocs(q)

    if (qSnapshot.docs.length === 0) {
      cryptoCoins.forEach((coin) => {
        todayCoins.push({
          id: coin.id,
          holdings: coin.totalHoldings,
        })
      })

      hRef = await doc(db, "historical", userId)
      await setDoc(hRef, {
        email,
        coins_history: [
          {
            date,
            coins: todayCoins,
          },
        ],
        nft_history: [],
      })
    } else {
      const hRecord = qSnapshot.docs[0]
        .data()
        .coins_history.find((coinObj) => coinObj.date === date)
      const hRecordIndex = qSnapshot.docs[0]
        .data()
        .coins_history.findIndex((coinObj) => coinObj.date === date)

      const historyCoins = cryptoCoins.map((coin) => ({
        id: coin.id,
        holdings: coin.totalHoldings,
      }))

      if (hRecord) {
        qSnapshot.docs[0].data().coins_history[hRecordIndex].coins =
          historyCoins
      } else {
        qSnapshot.docs[0].data().coins_history.push({
          date,
          coins: historyCoins,
        })
      }

      await updateDoc(hRef, {
        coins_history: qSnapshot.docs[0].data().coins_history,
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
