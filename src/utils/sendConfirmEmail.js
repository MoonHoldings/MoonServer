const sendConfirmToken = require("./sendConfirmToken")

module.exports = async (req, docRef, sgMail, email, username) => {
  if (docRef) {
    // Get Confirm Email Token
    const confirmToken = await sendConfirmToken(docRef.id)

    const confirmTokenUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/confirm-email/confirm-token/${confirmToken}`

    sgMail.setApiKey(process.env.SENDGRID_KEY)

    const mail = {
      to: email,
      from: {
        email: process.env.SG_SENDER,
        name: "MoonHoldings.xyz",
      },
      subject: "MoonHoldings Email Confirmation",
      html: `
      <h1>Hello ${username}!</h1>
      <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
        Please confirm your email address to complete sign up
      </div>
  
      <br/><br/>
  
      <a style="
          text-decoration: none;
          padding: 15px 30px;
          background-color: #13f195;
          border-radius: 3px;
          font-size: 20px;
          font-weight: bold;
          color: #000;
          "
        href="${confirmTokenUrl}"
        target="_blank"
      >
      Confirm your email
      </a>
  
      <br/><br/>
  
      <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
        Thanks!
      </div>
  
      <br/><br/>
  
      <div style="font-size: 17px; font-weight: semi-bold; color: #494949;">
        The Moon Holdings Team
      </div>
      `,
    }

    await sgMail.send(mail)
  }
}
