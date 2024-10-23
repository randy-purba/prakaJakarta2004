const jwt = require('jsonwebtoken')

module.exports = (data, jwtSecret, expiresIn) => jwt.sign(data, jwtSecret, expiresIn)
