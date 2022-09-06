"use strict";
const nodemailer = require("nodemailer");

async function sendEmail(amount, receipient) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Zoho',
            host: "smtp.zoho.comm",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "support@trustedexpertmining.com",
                pass: "@Trustedexpertmining123",
            },
        })

        let info = await transporter.sendMail({
            from: 'support@Trustedexpertmining.com',
            to: receipient,
            subject: "Transaction Approved",
            html: `<h3>${`
      Greetings!

      Your withdrawal request of $${amount} was successful, kindly wait while we process your request
      
      
      Kind regards,
      Trustedexpertmining.com
      `}</h3>`,
        });

        console.log(info);
    } catch (err) {
        console.log(err);
    }
}



module.exports = sendEmail;
