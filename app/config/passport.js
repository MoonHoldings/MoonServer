const { query, where, getDocs } = require("firebase/firestore");
const { Users } = require("./firebase");

const DiscordStrategy = require("passport-discord").Strategy;
require("dotenv").config({ path: "./config.env" });

const scopes = ["identify"];

module.exports = (passport) => {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: "http://localhost:9000/api/auth/discord/redirect",
        scope: scopes,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(accessToken, refreshToken);
        console.log(profile);

        const q = query(Users, where("email", "==", profile.email));
        const docSnap = await getDocs(q);

        if (docSnap.docs.length !== 0) {
          console.log("this account is signed up");
        } else {
          console.log("This account is not signed up");
        }
      }
    )
  );
};
