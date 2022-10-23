const { doc, query, where, getDocs, updateDoc } = require("firebase/firestore")
const { db, Users } = require("../config/firebase")

module.exports = async (userEmail) => {
  const NOMICS_KEY = process.env.NOMICS_KEY

  const q = query(Users, where("email", "==", userEmail))
  const qSnapshot = await getDocs(q)

  const updatedCoins = qSnapshot.docs[0]
    .data()
    .portfolio.coins.map(async (coin) => {
      const response = await axios.get(
        `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${coin.id}&intervals=1d,30d`
      )

      const fetchedCoin = response.data[0]

      const allWallets = fetchedCoin.wallets
      const updatedWallets = allWallets.map((wallet) => {
        const updatedValue = fetchedCoin.price * wallet.holding
        return { ...wallet, value: updatedValue }
      })

      let newTotalValue = 0
      updatedWallets.forEach((wallet) => {
        newTotalValue += wallet.value
      })

      const _24hr = fetchedCoin["1d"]
        ? fetchedCoin["1d"]["price_change_pct"]
        : ""

      const updatedCoin = {
        ...coin,
        _24hr,
        price: fetchedCoin.price,
        totalValue: newTotalValue,
      }

      return updatedCoin
    })

  qSnapshot.docs[0].data().portfolio.coins = updatedCoins

  const docRef = await doc(db, "users", qSnapshot.docs[0].id)
  await updateDoc(docRef, {
    portfolio: qSnapshot.docs[0].data().portfolio,
  })

  return updatedCoins
}
