const {
  getDocs,
  query,
  where,
  addDoc,
  getDoc,
  serverTimestamp,
} = require("firebase/firestore")
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
            console.log(profile.email)
            // console.log(profile)
            const username = await usernameGenerator(profile.email)
            // create user
            const newUserRef = await addDoc(Users, {
              strategy: "discord",
              username,
              email: profile.email,
              confirm: "",
              confirmEmailExpire: null,
              createdAt: serverTimestamp(),
              portfolioStyle: "grid",
              currency: "usd",
              activity: {
                visits: 0,
                streaks: {
                  _5days: 0,
                  _30days: 0,
                  _100days: 0,
                },
              },
              portfolio: {
                coins: [],
                nfts: [],
              },
            })
            const newUserSnap = await getDoc(newUserRef)
            // console.log("52 newUserSnap.data()", newUserSnap.data())
            return done(null, newUserSnap.data())
          }
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((obj, done) => {
    done(null, { ...obj })
  })

  // passport.deserializeUser(async (email, done) => {
  //   console.log(email)
  //   try {
  //     const q = query(Users, where("email", "==", email))
  //     const qSnapshot = await getDocs(q)

  //     if (qSnapshot.docs.length !== 0)
  //       done(new ErrorHandler("User not found", 404))

  //     done(null, qSnapshot.docs[0].data())
  //   } catch (error) {
  //     done(err, null)
  //   }
  // })
}
