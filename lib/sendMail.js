const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env
const Sendgrid = require('sendgrid')(SENDGRID_API_KEY)

module.exports = {
  sendAttach: (emailTo, subject, content, attach, filename, cb) => {
    const sgReq = Sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: {
        personalizations: [{
          to: emailTo,
          subject: `${subject}`,
        }],
        from: { email: SENDGRID_SENDER },
        content: [{
          type: 'text/html',
          value: `${content}`,
        }],
        attachments: [{
          content: attach,
          filename: `${filename}`,
        }],
      },
    })
    Sendgrid.API(sgReq, (err) => {
      if (err) {
        cb(err, null)
      } else {
        cb(null, 'Email Sent!')
      }
    })
  },
  sendMail: (emailTo, subject, content, cb) => {
    const sgReq = Sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: {
        personalizations: [{
          to: emailTo,
          subject: `${subject}`,
        }],
        from: { email: SENDGRID_SENDER },
        content: [{
          type: 'text/html',
          value: `${content}`,
        }],
      },
    })

    Sendgrid.API(sgReq, (err) => {
      if (err) {
        cb(err, null)
      } else {
        cb(null, 'Email Sent!')
      }
    })
  },
}
