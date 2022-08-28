const crypto = require("crypto")
const { doc, updateDoc } = require("firebase/firestore")
const { db } = require("../config/firebase")

module.exports = async (userId) => {
  // Generating a Token
  const confirmToken = crypto.randomBytes(20).toString("hex")

  // Hashing and adding confirmEmailToken to userSchema
  const hashedConfirmToken = crypto
    .createHash("sha256")
    .update(confirmToken)
    .digest("hex")
  const confirmEmailExpire = Date.now() + 15 * 60 * 1000

  const userRef = await doc(db, "users", userId)
  await updateDoc(userRef, {
    confirm: hashedConfirmToken,
    confirmEmailExpire,
  })

  return confirmToken
}
