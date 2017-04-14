'use strict'

const path = require('path')
const storage = require('node-persist')

// Initialize our storage system
storage.initSync({
  dir: path.resolve(__dirname, '../../persist')
})

const thermostat = require('./accessory')

thermostat.getServices()

module.exports.start = () => {
  console.log('HAP-NodeJS starting...')
  thermostat.accessory.publish({
    port: 51826,
    username: thermostat.username,
    pincode: thermostat.pincode
  })
}
