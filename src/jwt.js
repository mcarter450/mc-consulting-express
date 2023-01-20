const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

// get config vars
dotenv.config()

exports.generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

exports.authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    
    if (err) {
      console.log(err)
      return res.sendStatus(403)
    }

    req.user = user

    next()
  })
}
