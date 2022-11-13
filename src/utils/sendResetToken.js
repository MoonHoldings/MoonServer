const crypto = require("crypto")
const { setDoc, doc } = require("firebase/firestore")
const { db } = require("../config/firebase")

module.exports = async (userId) => {
  // Generating a Token
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hashing and adding resetPasswordToken to userSchema
  const hashedResetPassword = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
  const resetPasswordExpire = Date.now() + 15 * 60 * 60 * 1000

  const userRef = await doc(db, "users", userId)
  await setDoc(
    userRef,
    {
      resetPasswordToken: hashedResetPassword,
      resetPasswordExpire,
    },
    { merge: true }
  )

  return resetToken
}
