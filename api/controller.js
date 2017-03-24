'use strict'

const Daikin = require('./thermostat')
const daikin = new Daikin()
const ctrl = {}

ctrl.status = (req, res, next) => {
  daikin.getStatus((err, data) => {
    if (err) {
      return next(err)
    }
    res.json(data)
  })
}

ctrl.setTargetTemperature = (req, res, next) => {
  daikin.setTargetTemperature(req.params.temp, (err, data) => {
    if (err) {
      return next(err)
    }
    res.json(data)
  })
}

ctrl.setTargetState = (req, res, next) => {
  daikin.setTargetState(req.params.state, (err, data) => {
    if (err) {
      return next(err)
    }
    res.json(data)
  })
}

module.exports = ctrl
