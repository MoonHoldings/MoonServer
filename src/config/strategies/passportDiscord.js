const { getDocs, query, where, addDoc, getDoc } = require("firebase/firestore")
const { Strategy } = require("passport-discord")
const ErrorHandler = require("../../utils/errorHandler")
const usernameGenerator = require("../../utils/usernameGenerator")
const { Users } = require("../firebase")

module.exports = (passport) => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: "/api/auth/discord/redirect",
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const q = query(
            Users,
            where("strategy", "==", "discord"),
            where("email", "==", profile.email)
          )
          const qSnapshot = await getDocs(q)
          if (qSnapshot.docs.length !== 0) {
            return done(null, qSnapshot.docs[0].data())
          } else {
            const username = await usernameGenerator(profile.email)
            // create user
            const newUserRef = await addDoc(Users, {
              strategy: "discord",
              username,
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

  passport.serializeUser((user, done) => {
    done(null, user.email)
  })

  passport.deserializeUser(async (email, done) => {
    try {
      const q = query(Users, where("email", "==", email))
      const qSnapshot = await getDocs(q)

      if (qSnapshot.docs.length !== 0)
        done(new ErrorHandler("User not found", 404))

      done(null, qSnapshot.docs[0].data())
    } catch (error) {
      done(err, null)
    }
  })
}
