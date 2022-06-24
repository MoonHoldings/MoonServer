const express = require("express");
const passport = require("passport");

const userRoutes = require("./src/routes/userRoutes");
const errorMiddleware = require("./src/middlewares/error");
const passportInit = require("./src/config/strategies/passportDiscord");

require("dotenv").config({ path: "./src/config/config.env" });

const app = express();

app.use(express.json());

// Passport config
passportInit(passport);

// all the routes
app.use("/api", userRoutes);

// Middleware for error handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`The App is running on port ${PORT}`));
