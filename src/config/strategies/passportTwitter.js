const {
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  serverTimestamp,
} = require("firebase/firestore")
const { Strategy } = require("passport-twitter")
const usernameGenerator = require("../../utils/usernameGenerator")
const { Users } = require("../firebase")

module.exports = (passport) => {
  // <1> Serialization and deserialization
  passport.serializeUser(function (user, done) {
    done(null, user)
  })
  passport.deserializeUser(function (obj, done) {
    done(null, obj)
  })

  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CLIENT_ID,
        consumerSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: `/api/auth/twitter/callback`,
        includeEmail: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile.emails[0].value)
        const userEmail = profile.emails[0].value

        try {
          const q = query(
            Users,
            where("strategy", "==", "twitter"),
            where("email", "==", userEmail)
          )
          const snap = await getDocs(q)

          if (snap.docs.length !== 0) {
            done(null, snap.docs[0].data())
          } else {
            // Generate a username
            const username = await usernameGenerator(userEmail)
            // Create a user
            const newUserRef = await addDoc(Users, {
              strategy: "twitter",
              username,
              email: userEmail,
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
            return done(null, newUserSnap.data())
          }
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}
