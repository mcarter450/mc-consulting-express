const { SESv2Client, GetContactListCommand, SendEmailCommand } = require("@aws-sdk/client-sesv2")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { siteVerify } = require('./src/recaptcha.js')
const { generateAccessToken, authenticateToken } = require('./src/jwt.js')
const app = express()
const https = require('https')
const fs = require('fs')
const port = 3001

// create application/json parser
const jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//app.use(express.multipart())

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use( cors(corsOptions) )

app.get('/api/generateToken', (req, res) => {
  const token = generateAccessToken({ username: 'webuser' });
  res.json(token);
});

app.post('/api/sendEmail', jsonParser, [siteVerify, authenticateToken], (req, res) => {

  const client = new SESv2Client({ region: 'us-west-2' });

  const reply_to_email = req.body.email || '',
        name = req.body.name || '';
        message = req.body.message || '',
        html_message = req.body.message ? req.body.message.replace(/\n/g, "<br>") : ''

  // Replace sender@example.com with your "From" address.
  // This address must be verified with Amazon SES.
  const sender_email = 'webmaster@mcarter.consulting';

  // Replace these sample addresses with the addresses of your recipients. If
  // your account is still in the sandbox, these addresses must be verified.
  const recipient_emails = ['mike@mcarter.consulting'];

  // Specify a configuration set. If you do not want to use a configuration
  // set, comment the following variable, and the
  // 'ConfigurationSetName' => $configuration_set argument below.
  //$configuration_set = 'ConfigSet';

  const subject = 'Guest Email from MCarter.consulting',
        plaintext_body = `Name:\n\n${name}
${name}\n\n
Email:\n\n
${reply_to_email}
Message:\n\n
${message}`

  const html_body = `<h4>Name</h4>
<p>${name}</p>
<h4>Email</h4>
<p>${reply_to_email}</p>
<h4>Message</h4>
<p>${html_message}</p>`

  const char_set = 'UTF-8'

  let params = {
    'Destination': {
      'ToAddresses': recipient_emails,
    },
    'ReplyToAddresses': [reply_to_email],
    'FromEmailAddress': sender_email,
    'Content': {
      'Simple': {
        'Body': {
            'Html': {
                'Charset': char_set,
                'Data': html_body,
            },
            'Text': {
                'Charset': char_set,
                'Data': plaintext_body,
            },
        },
        'Subject': {
            'Charset': char_set,
            'Data': subject,
        },
      }
    },
    // If you aren't using a configuration set, comment or delete the
    // following line
    //'ConfigurationSetName' => $configuration_set,
  }

  const command = new SendEmailCommand(params);

  // async/await.
  client.send(command).then(
    (data) => {
      // process data.
      res.send('Success')
    },
    (error) => {
      // error handling.
      res.send(error)
    }
  )
  
})

if (process.env.NODE_ENV == 'development') {
  // start http server
  app.listen(port, () => {
    console.log(`Email app listening on port ${port}`)
  })
} 
else {
  // start production https server
  let sslOptions = {
     key: fs.readFileSync('/etc/letsencrypt/live/mcarter.consulting/privkey.pem'),
     cert: fs.readFileSync('/etc/letsencrypt/live/mcarter.consulting/fullchain.pem')
  };

  let serverHttps = https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Email secure app listening on port ${port}`)
  })
}
