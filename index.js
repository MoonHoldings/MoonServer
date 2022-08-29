require("dotenv").config({ path: "./src/config/config.env" })

const express = require("express")
const passport = require("passport")
const session = require("express-session")
const cors = require("cors")

const userRoutes = require("./src/routes/userRoutes")
const coinRoutes = require("./src/routes/coinRoutes")

const errorMiddleware = require("./src/middlewares/error")
const passportLocal = require("./src/config/strategies/passportLocal")
const passportDiscord = require("./src/config/strategies/passportDiscord")
const passportTwitter = require("./src/config/strategies/passportTwitter")

// const corsOptions = require("./src/constants/config")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: "https://moonholdings.xyz",
  })
)
// app.use(cors())
// app.use(cors(corsOptions))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())

passportLocal(passport)
passportDiscord(passport)
passportTwitter(passport)

// all the routes
app.use("/api", userRoutes)
app.use("/api", coinRoutes)

// Middleware for error handling
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`The App is running on port ${PORT}`))
