'use strict'

const nconf = require('nconf')
const path = require('path')
const remotes = require('../remotes.json')

const configFile = path.resolve(__dirname, '../persist/config.json')

nconf.argv().env()
  .file({ file: configFile })

nconf.defaults({
  username: null,
  pincode: null,
  name: 'Thermostat',
  remote: 'daikin-arc452a4',
  currentTargetTemp: 25,
  currentState: 'off',
  dht: false,
  irsend: 'irsend',
  sensorType: 11,
  sensorGpio: 4,
})

nconf.set('minCoolTemp', remotes[nconf.get('remote')].modes.cool.min)
nconf.set('maxCoolTemp', remotes[nconf.get('remote')].modes.cool.max)
nconf.set('minHeatTemp', remotes[nconf.get('remote')].modes.heat.min)
nconf.set('maxHeatTemp', remotes[nconf.get('remote')].modes.heat.max)
nconf.set('minAutoTemp', remotes[nconf.get('remote')].modes.auto.min)
nconf.set('maxAutoTemp', remotes[nconf.get('remote')].modes.auto.max)

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
