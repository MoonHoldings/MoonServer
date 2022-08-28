const { query, where, getDocs, addDoc, getDoc } = require("firebase/firestore")
const { Strategy } = require("passport-twitter")
const usernameGenerator = require("../../utils/usernameGenerator")
const { Users } = require("../firebase")

module.exports = (passport) => {
  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: "/api/auth/twitter/callback",
        includeEmail: true,
      },
      async function (token, tokenSecret, profile, cb) {
        const userEmail = profile.emails[0].value
        const q = query(
          Users,
          where("strategy", "==", "twitter"),
          where("email", "==", userEmail)
        )
        const snap = await getDocs(q)
        if (snap.docs.length !== 0) {
          cb(null, snap.docs[0].data())
        } else {
          // Generate a username
          const username = await usernameGenerator(userEmail)
          // Create a user
          const newUserRef = await addDoc(Users, {
            strategy: "twitter",
            username,
            email: userEmail,
          })
          const newUserSnap = await getDoc(newUserRef)
          return cb(null, newUserSnap.data())
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const q = query(Users, where("id", "==", id))
      const qSnapshot = await getDocs(q)

      if (qSnapshot.docs.length !== 0)
        done(new ErrorHandler("User not found", 404))

      done(null, qSnapshot.docs[0].data())
    } catch (error) {
      done(err, null)
    }
  })
}
