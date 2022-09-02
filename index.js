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

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors(
  {
    origin: '*'
  }
))
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

app.get('/hello', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(
    `Hello this is <strong>MoonServer</strong>! 
    <br/> Please visit the frontend here: 
    <h1><a href="https://moonholdings.xyz">MoonHoldings.xyz</a></h1>`
  );
});

// Middleware for error handling
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`The App is running on port ${PORT}`))
