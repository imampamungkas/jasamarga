const EWS = require("@widodopangestu/node-ews");

// exchange server connection info
const ewsConfig = {
  username: process.env.SMTP_USER,
  password: process.env.SMTP_PASS,
  host: process.env.SMTP_HOST,
};

// initialize node-ews
const ews = new EWS(ewsConfig);

// define ews api function
const ewsFunction = "CreateItem";

exports.sendEmail = (to, subject, body) => {
  const ewsArgs = {
    attributes: {
      MessageDisposition: "SendAndSaveCopy",
    },
    SavedItemFolderId: {
      DistinguishedFolderId: {
        attributes: {
          Id: "sentitems",
        },
      },
    },
    Items: {
      Message: {
        ItemClass: "IPM.Note",
        Subject: subject,
        Body: {
          attributes: {
            BodyType: "HTML",
          },
          $value: body,
        },
        ToRecipients: {
          Mailbox: {
            EmailAddress: to,
          },
        },
        IsRead: "false",
      },
    },
  };

  return ews.run(ewsFunction, ewsArgs);
};
