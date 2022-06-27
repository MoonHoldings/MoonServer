const express = require("express")
const passport = require("passport")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const userRoutes = require("./src/routes/userRoutes")
const errorMiddleware = require("./src/middlewares/error")
require("./src/config/strategies/passportLocal")
const passportDiscord = require("./src/config/strategies/passportDiscord")

require("dotenv").config({ path: "./src/config/config.env" })

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
passportDiscord(passport)

// all the routes
app.use("/api", userRoutes)

// Middleware for error handling
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`The App is running on port ${PORT}`))
