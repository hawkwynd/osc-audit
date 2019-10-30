const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const config = require('../config');

const mailer = async(to, subject, html) => {

  const oauth2Client = new OAuth2(
    config.gmail.client_id,
    config.gmail.client_secret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
      refresh_token: config.gmail.refresh_token
  });
  const header = await oauth2Client.getRequestHeaders();
  const accessToken = header.Authorization.replace('Bearer ', "");

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.gmail.client_user,
      clientId: config.gmail.client_id,
      clientSecret: config.gmail.secret,
      refreshToken: config.gmail.refresh_token,
      accessToken: accessToken
    },
  });

var mailOptions = {
    from : 'OMNICOMMANDER <contact@omnicommander.com>',
    to: to,
    subject: subject,
    html: html
};

transporter.sendMail(mailOptions, function(err, res) {
    if(err) {
        console.log('Error sending Email');
        console.log(err);
    } else {
        console.log('email sent');
    }
    transporter.close();
});
};

module.exports = mailer;