"use strict";
const nodemailer = require("nodemailer");

async function sendEmail(amount, receipient) {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Zoho',
      host: "smtp.zoho.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "support@trustedexpertmining.com",
        pass: "@Trustedexpertmining123",
      },
    })

    let info = await transporter.sendMail({
      from: 'support@trustedexpertmining.com',
      to: receipient,
      subject: "Withdrawal Request",
      html: `<h3>${`
      Greetings!

      This is to inform you that your withdrawal request of $${amount} have approved and funds have been sent to your selected account
      
      
      Kind regards,
      Trustedexpertmining.com
      `}</h3>`,
    });

  } catch (err) {
    console.log(err);
  }
}

module.exports = sendEmail;