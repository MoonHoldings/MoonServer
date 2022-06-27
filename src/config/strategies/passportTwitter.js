const { query, where, getDocs, addDoc, getDoc } = require("firebase/firestore")
const { Users } = require("../firebase")

const TwitterStrategy = require("passport-twitter").Strategy

module.exports = (passport) => {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: "http://localhost:9000/api/auth/twitter/callback",
      },
      function (token, tokenSecret, profile, done) {
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
