'use strict'

const path = require('path')
const storage = require('node-persist')
const onload = require('./onload')

// Initialize our storage system
storage.initSync({
  dir: path.resolve(__dirname, '../../persist')
})

const thermostat = require('./accessory')

thermostat.getServices()

module.exports.start = () => {
  thermostat.accessory.publish({
    port: 51826,
    username: thermostat.username,
    pincode: thermostat.pincode
  })

  onload()
}
