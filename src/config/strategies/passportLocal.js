const { query, where, getDocs } = require("firebase/firestore")
const passport = require("passport")
const { Strategy } = require("passport-local")
const { compare } = require("bcrypt")

const ErrorHandler = require("../../utils/errorHandler")
const { Users } = require("../firebase")

passport.use(
  new Strategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      console.log(email)
      console.log(password)

      if (!email || !password) {
        throw new ErrorHandler("Every field needs to be fulfilled", 400)
      }

      try {
        const q = query(Users, where("email", "==", email))
        const qSnapshot = await getDocs(q)
        if (qSnapshot.docs.length === 0) {
          throw new ErrorHandler(
            "There is no account found with this email",
            400
          )
        }
        const user = await qSnapshot.docs[0].data()
        const isValid = await compare(password, user.password)

        if (isValid) {
          console.log("Authenticated Successfully!")
          done(null, user)
        } else {
          console.log("Invalid Authentication here")
          done(null, null)
        }
      } catch (error) {
        console.log(error)
        done(error, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  console.log("Serializing User...")
  console.log(user)
  return done(null, user.email)
})

passport.deserializeUser(async (email, done) => {
  console.log("Deserializing User")
  console.log(email)
  try {
    const q = query(Users, where("email", "==", email))
    const qSnapshot = await getDocs(q)

    if (qSnapshot.docs.length === 0)
      throw new ErrorHandler("User not found", 404)
    const user = qSnapshot.docs[0].data()
    console.log(user)
    done(null, user)
  } catch (error) {
    console.log(err)
    done(err, null)
  }
})
