const { getDocs, query, where, addDoc, getDoc } = require("firebase/firestore")
const { Strategy } = require("passport-discord")
const ErrorHandler = require("../../utils/errorHandler")
const { Users } = require("../firebase")

module.exports = (passport) => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: "http://localhost:9000/api/auth/discord/redirect",
        scope: ["identify"],
      },
      async (accessToken, refreshToken, profile, done) => {
        // console.log(accessToken, refreshToken)
        // console.log(profile)

        try {
          const q = query(Users, where("email", "==", profile.email))
          const qSnapshot = await getDocs(q)
          if (qSnapshot.docs.length !== 0) {
            return done(null, qSnapshot.docs[0].data())
          } else {
            // create user
            const newUserRef = await addDoc(Users, {
              username: profile.username,
              email: profile.email,
            })
            const newUserSnap = await getDoc(newUserRef)
            return done(null, newUserSnap.data())
          }
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}
