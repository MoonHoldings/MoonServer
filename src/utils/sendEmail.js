const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
  // pixa.504@gmail.com (also google cloud)
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      type: process.env.SMPT_AUTH_TYPE,
      user: process.env.SMPT_MAIL_USERNAME,
      pass: process.env.SMPT_MAIL_PASSWORD,
      clientId: process.env.SMPT_OAUTH_CLIENTID,
      clientSecret: process.env.SMPT_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.SMPT_OAUTH_REFRESH_TOKEN,
    },
  })

  const mailOptions = {
    from: process.env.SMPT_MAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
