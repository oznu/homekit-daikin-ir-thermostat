'use strict'

const nconf = require('nconf')
const path = require('path')

const configFile = path.resolve(__dirname, '../persist/config.json')

nconf.argv().env()
  .file({ file: configFile })

nconf.defaults({
  username: null,
  pincode: null,
  name: 'Thermostat',
  remote: 'daikin-ARC452A4',
  defaultTemp: 25,
  defaultState: 'off',
  dht: false,
  irsend: 'irsend',
  sensorType: 11,
  sensorGpio: 4,
  minCoolTemp: 18,
  maxCoolTemp: 30,
  minHeatTemp: 10,
  maxHeatTemp: 30,
  minAutoTemp: 18,
  maxAutoTemp: 30
})

// Generate username on first run.
let genUsername = () => {
  var hexDigits = '0123456789ABCDEF'
  var username = ''
  for (var i = 0; i < 6; i++) {
    username += hexDigits.charAt(Math.round(Math.random() * 15))
    username += hexDigits.charAt(Math.round(Math.random() * 15))
    if (i !== 5) username += ':'
  }
  return username
}

if (!nconf.get('username')) {
  nconf.set('username', genUsername())
}

// Generate pincode on first run
let getPincode = () => {
  let code = Math.floor(10000000 + Math.random() * 90000000) + ''
  code = code.split('')
  code.splice(3, 0, '-')
  code.splice(6, 0, '-')
  code = code.join('')
  return code
}

if (!nconf.get('pincode')) {
  nconf.set('pincode', getPincode())
}

// save generated username and pin
nconf.save()

module.exports = nconf
