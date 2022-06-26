const { query, where, getDocs, doc, getDoc } = require("firebase/firestore")
const { db } = require("../firebase")
const bcrypt = require("bcrypt")
const ErrorHandler = require("../../utils/errorHandler")

const LocalStrategy = require("passport-local").Strategy

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        //Login
        //check if email exists

        const emailDocSnap = await getDoc(doc(db, "users", email))
        if (!emailDocSnap.exists()) {
          done(null, false, { message: "No user with this email" })
        }
        const user = emailDocSnap.data()

        try {
          const match = await bcrypt.compare(password, user.password)

          if (match) {
            return done(null, user, { message: "Logged in successfully" })
          }

          return done(null, false, { message: "Wrong username or password" })
        } catch (error) {
          return new ErrorHandler("Email auth failed - " + error.message, 401)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.email)
  })

  passport.deserializeUser(async (email, done) => {
    const emailDocSnap = await getDoc(doc(db, "users", email))
    done(err, emailDocSnap.data())
  })
}
