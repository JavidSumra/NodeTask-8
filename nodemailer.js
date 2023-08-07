/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const node = require("nodemailer");
require("dotenv").config();
// const secureEnv = require("secure-env");
// global.env = secureEnv({ secret: "This is My Secure Code For .env File" });
module.exports = async (email, subject, text) => {
  console.log(process.env.email);
  const transporter = node.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.Password,
    },
  });

  let messagedetail = {
    from: process.env.email,
    to: email,
    subject: subject,
    text: text,
  };

  let send = await transporter.sendMail(messagedetail, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email Sent Successfully");
    }
  });
};
