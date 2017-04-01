'use strict'

const nconf = require('nconf')

nconf.argv().env()

nconf.defaults({
  remote: 'daikin-ARC452A4',
  defaultTemp: 25,
  defaultState: 'off',
  dht: false,
  sensorType: 11,
  sensorGpio: 4,
  minCoolTemp: 18,
  maxCoolTemp: 30,
  minHeatTemp: 10,
  maxHeatTemp: 30,
  minAutoTemp: 18,
  maxAutoTemp: 30
})

module.exports = nconf
