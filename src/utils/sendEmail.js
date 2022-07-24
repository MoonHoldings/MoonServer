const nodemailer = require("nodemailer")
const { google } = require("googleapis")
const OAuth2 = google.auth.OAuth2

const ErrorHandler = require("./errorHandler")

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.SMPT_OAUTH_CLIENTID,
    process.env.SMPT_OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.SMPT_OAUTH_REFRESH_TOKEN,
  })

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(new ErrorHandler("Failed to create access token :(", 401))
      }
      resolve(token)
    })
  })

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.SMPT_MAIL,
      accessToken,
      clientId: process.env.SMPT_OAUTH_CLIENTID,
      clientSecret: process.env.SMPT_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.SMPT_OAUTH_REFRESH_TOKEN,
    },
  })

  return transporter
}

// pixa.504@gmail.com (also google cloud)
const sendEmail = async (options) => {
  let emailTransporter = await createTransporter()
  await emailTransporter.sendMail(options)
}

module.exports = sendEmail
