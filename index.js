const express = require("express")
const passport = require("passport")
// const session = require("express-session")

const userRoutes = require("./src/routes/userRoutes")
const errorMiddleware = require("./src/middlewares/error")
const passportDiscord = require("./src/config/strategies/passportDiscord")
// const passportLocal = require("./src/config/strategies/passportLocal")

require("dotenv").config({ path: "./src/config/config.env" })

const app = express()

app.use(express.json())

/*
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);
*/

/*
// Passport config
passportLocal(passport);
app.use(passport.initialize());
app.use(passport.session());
*/
passportDiscord(passport)

/*
// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
});
*/

// all the routes
app.use("/api", userRoutes)

// Middleware for error handling
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`The App is running on port ${PORT}`))
