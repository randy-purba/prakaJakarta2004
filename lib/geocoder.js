const nodeGeocoder = require('node-geocoder')
console.log(process.env.MAPS_API_SERVER_KEY)
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.MAPS_API_SERVER_KEY,
  formatter: null,
}
const geocoder = nodeGeocoder(options)
module.exports = geocoder
