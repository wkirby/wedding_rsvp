import AWS from "aws-sdk";

AWS.config.update({ region: "us-west-2" });
const ses = new AWS.SES();

export function sendMessage(to, subject, message) {
  let emailParams = {
    Destination: {
      ToAddresses: to
    },
    Message: {
      Body: {
        Text: {
          Data: message
        }
      },
      Subject: {
        Data: subject
      }
    },
    Source: "noreply@apsis.io"
  };

  console.log("Attempting to send email...");
  return new Promise((res, rej) => {
    ses.sendEmail(emailParams, function(err, data) {
      if (err) {
        console.error("Email sending failed.");
        console.error(err, err.stack);
        rej(err);
      } else {
        console.log(`Sent email (${subject}) to: ${to}`);
        res(data);
      }
    });
  });
}
