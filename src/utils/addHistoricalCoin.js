const {
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} = require("firebase/firestore")
const { Historical, Users, db } = require("../config/firebase")

module.exports = async (email, coin) => {
  const date = new Date().toUTCString()

  try {
    let qUserSnap, userId, hRef

    const q = await query(Historical, where("email", "==", email))
    const qSnapshot = await getDocs(q)

    if (qSnapshot.docs.length === 0) {
      //get user id
      const qUser = await query(
        Users,
        where("strategy", "==", "local"),
        where("email", "==", email)
      )
      qUserSnap = await getDocs(qUser)
      userId = qUserSnap.docs[0].id

      //set historical data with this user id
      hRef = await doc(db, "historical", userId)
      await setDoc(hRef, {
        email,
        coins_history: [
          {
            date,
            coins: [
              {
                id: coin.id,
                holdings: coin.totalHoldings,
              },
            ],
          },
        ],
        nft_history: [],
      })
    } else {
      const record = qSnapshot.docs[0]
        .data()
        .coins_history.find((history) => history.date === date)
      const recordIndex = qSnapshot.docs[0]
        .data()
        .coins_history.find((history) => history.date === date)

      if (record) {
        qSnapshot.docs[0].data().coins_history[recordIndex].coins.push({
          id: coin.id,
          holdings: coin.totalHoldings,
        })
      } else {
        qSnapshot.docs[0].data().coins_history.push({
          date,
          coins: [
            {
              id: coin.id,
              holdings: coin.totalHoldings,
            },
          ],
        })
      }

      // update coins_history
      await updateDoc(hRef, {
        coins_history: qSnapshot.docs[0].data().coins_history,
      })
    }

    return {
      success: true,
      message: "The coin has been saved to historical data",
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    }
  }
}
