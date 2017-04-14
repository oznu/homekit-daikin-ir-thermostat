'use strict'

const accessory = require('../hap/accessory')

const ctrl = {}

ctrl.status = (req, res, next) => {
  res.json(accessory.thermostat.status)
}

ctrl.setTargetTemperature = (req, res, next) => {
  accessory.emit('setTargetTemperature', req.params.temp)
  res.json(accessory.thermostat.status)
}

ctrl.setTargetState = (req, res, next) => {
  accessory.emit('setTargetState', req.params.state)
  res.json(accessory.thermostat.status)
}

module.exports = ctrl
