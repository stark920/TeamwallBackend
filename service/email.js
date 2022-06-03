const nodemailer = require('nodemailer');

const config = {
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
};
// 建立SMTP客戶端物件
const transporter = nodemailer.createTransport(config);

// 傳送郵件
const sendMail = (mail) => new Promise((resolve, reject) => {
  transporter.sendMail(mail, (error, info) => {
    if (error) {
      reject(error);
    } else {
      resolve(info.response);
    }
  });
});

module.exports = sendMail;
