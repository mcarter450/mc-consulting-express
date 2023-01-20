const dotenv = require('dotenv')
const axios = require('axios')

// get config vars
dotenv.config()

exports.siteVerify = (req, res, next) => {
  const ipAddress = req.socket.remoteAddress

  axios.post('https://www.google.com/recaptcha/api/siteverify', {
	  secret: process.env.RECAPTCHA_SECRET_KEY,
	  response: req.body.retoken,
	  remoteip: ipAddress
	})
	.then(function (response) {
	  next()
	})
	.catch(function (error) {
	  console.log(error);
	  return res.sendStatus(403)
	})
}
