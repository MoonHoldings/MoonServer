const { query, where, getDocs } = require("firebase/firestore")
const { Strategy } = require("passport-local")
const { compare } = require("bcrypt")

const ErrorHandler = require("../../utils/errorHandler")
const { Users } = require("../firebase")

module.exports = (passport) => {
  passport.use(
    new Strategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        if (!email || !password) {
          return done(
            new ErrorHandler("Every field needs to be fulfilled", 400)
          )
        }

        try {
          const q = query(Users, where("email", "==", email))
          const qSnapshot = await getDocs(q)
          if (qSnapshot.docs.length === 0) {
            return done(
              new ErrorHandler(
                "There is no account associated to this email",
                401
              )
            )
          }
          const user = await qSnapshot.docs[0].data()
          const isValid = await compare(password, user.password)

          if (isValid) {
            return done(null, user)
          } else {
            return done(
              new ErrorHandler("The email or password is incorrect", 401)
            )
          }
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    return done(null, user.email)
  })

  passport.deserializeUser(async (email, done) => {
    try {
      const q = query(Users, where("email", "==", email))
      const qSnapshot = await getDocs(q)

      const user = await qSnapshot.docs[0].data()
      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  })
}
