require("dotenv").config({ path: "./src/config/config.env" })

const express = require("express")
const cors = require("cors")
const passport = require("passport")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const errorMiddleware = require("./src/middlewares/error")

require("./src/config/strategies/passportLocal")(passport)
require("./src/config/strategies/passportTwitter")(passport)
require("./src/config/strategies/passportDiscord")(passport)

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(passport.initialize())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "MOON_SESSION",
    resave: true,
    saveUninitialized: true,
  })
)
app.use(cookieParser(process.env.COOKIE_SECRET))

// Routes
const userRoutes = require("./src/routes/userRoutes")
const coinRoutes = require("./src/routes/coinRoutes")
app.use("/api", userRoutes)
app.use("/api", coinRoutes)

app.get("/hello", (req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate")
  res.end(
    `Hello this is <strong>MoonServer</strong>! 
    <br/> Please visit the frontend here: 
    <h1><a href="https://moonholdings.xyz">MoonHoldings.xyz</a></h1>`
  )
})

// Middleware for error handling
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`The App is running on port ${PORT}`))
