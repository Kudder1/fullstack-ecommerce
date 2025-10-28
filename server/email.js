const { getUrl } = require('./utils')

const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_BUCKET_REGION,
}

const getEmailParams = (recipientEmail, verificationId, emailType, url) => {
  switch(emailType) {
    case 'verifyEmail':
      const verificationUrl = `${url}/email-confirmation?token=${verificationId}`
      return {
        Source: process.env.AWS_SES_SENDER, // Verified SES Email
        Destination: {
          ToAddresses: [recipientEmail],
        },
        ReplyToAddresses: [],
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
            },
            Text: {
              Charset: "UTF-8",
              Data: `Click the link to verify your email: ${verificationUrl}`,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: 'Verify your email!',
          },
        },
      }
    case 'resetPassword':
      const resetPasswordUrl = `${url}/new-password?token=${verificationId}`
      return {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
          ToAddresses: [recipientEmail],
        },
        ReplyToAddresses: [],
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `<p>Click <a href="${resetPasswordUrl}">here</a> to reset your password.</p>`,
            },
            Text: {
              Charset: "UTF-8",
              Data: `Click the link to reset your password: ${resetPasswordUrl}`,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: 'Reset your password!',
          },
        },
      }
    default:
      throw new Error('Unknown email type')
  }
}

const sendEmail = async (recipientEmail, verificationId, emailType) => {
  const { SESClient } = await import('@aws-sdk/client-ses')
  const { SendEmailCommand } = await import('@aws-sdk/client-ses')
  const sesClient = new SESClient(SES_CONFIG)
  const params = getEmailParams(recipientEmail, verificationId, emailType, getUrl())
  try {
    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)
    console.log("Email sent:", response)
  } catch (error) {
    console.error("Error sending email:", error)
  }
}

module.exports = { sendEmail }