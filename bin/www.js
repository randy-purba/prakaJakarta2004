#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app')
const debug = require('debug')('praka_jakarta-api:server')
const http = require('http')
const models = require('../config/models')

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}
const port = normalizePort(process.env.PORT || '3000')
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

    // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}
function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`
  debug(`Listening on ${bind}`)
}
// { force: true }
app.set('port', port)
models.sequelize.sync({ force: false }).then(() => {
  server.listen(port, () => console.log('praka_jakarta Database Sync Done.'))
  server.on('error', onError)
  server.on('listening', onListening)
})
/**
 * Event listener for HTTP server "error" event.
 */


/**
 * Event listener for HTTP server "listening" event.
 */
