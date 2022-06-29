const { query, where, getDocs, addDoc, getDoc } = require("firebase/firestore")
const passport = require("passport")
const TwitterStrategy = require("passport-twitter")
const { Users } = require("../firebase")

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "http://localhost:9000/api/auth/twitter/callback",
    },
    async function (token, tokenSecret, profile, cb) {
      console.log(profile)

      const q = query(Users, where("id", "==", profile.id))
      const snap = await getDocs(q)
      if (snap.docs.length !== 0) {
        console.log(snap.docs[0].data())
        cb(null, snap.docs[0].data())
      } else {
        const newUserRef = await addDoc(Users, {
          id: profile.id,
        })
        const newUserSnap = await getDoc(newUserRef)
        return cb(null, newUserSnap.data())
      }
    }
  )
)

passport.serializeUser((user, done) => {
  console.log("Serializing user...")
  console.log(user)
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing User")
  console.log(id)
  try {
    const q = query(Users, where("id", "==", id))
    const qSnapshot = await getDocs(q)

    if (qSnapshot.docs.length !== 0)
      throw new ErrorHandler("User not found", 404)

    done(null, qSnapshot.docs[0].data())
  } catch (error) {
    done(err, null)
  }
})
