const fs = require("fs");
const mustache = require("mustache");

module.exports = {
  sendMailForgotPassword(payload) {
    const mail = require("./index");
    payload.email_logo_url = process.env.EMAIL_LOGO_URL;
    var base = process.env.PWD;
    const template = fs.readFileSync(
      base + "/app/emails/template/forgot_password.html",
      "utf8"
    );

    mail
      .sendEmail(
        payload.email,
        "Jasamarga - Lupa Password",
        mustache.render(template, { ...payload })
      )
      .then((result) => {
        console.log(JSON.stringify(result));
      })
      .catch((err) => {
        console.log(err.stack);
      });
  },
};
