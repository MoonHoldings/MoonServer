const express = require("express");
const passport = require("passport");

const userRoutes = require("./app/routes/userRoutes");
const errorMiddleware = require("./app/middlewares/error");
const passportInit = require("./app/config/passport");

require("dotenv").config({ path: "./app/config/config.env" });

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
