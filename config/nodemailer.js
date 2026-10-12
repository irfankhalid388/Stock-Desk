require('dotenv').config(); // loads SMTP_USER and SMTP_PASS from .env
const nodemailer = require('nodemailer');

// created ONCE
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (to, subject, text, html) => {
  const info = await transport.sendMail({
    from: `"My App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return info;
};

module.exports = sendMail;