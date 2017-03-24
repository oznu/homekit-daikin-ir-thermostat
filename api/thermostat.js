'use strict'

const nodeLIRC = require('node-lirc')

nodeLIRC.init()

class Daikin {

  constructor () {
    this.status = {}
    this.status.temperature = 25
    this.status.targetTemperature = 25
    this.status.heatingThresholdTemperature = 25
    this.status.heatingCoolingState = 'auto'
    this.status.targetHeatingCoolingState = 'auto'
    this.status.targetFanSpeed = 'auto'
  }

  getStatus (callback) {
    callback(null, this.status)
  }

  setTargetTemperature (value, callback) {
    this.status.targetTemperature = parseFloat(value)
    this.sendUpdate(callback)
  }

  setTargetState (value = 'off', callback) {
    this.status.heatingCoolingState = value
    this.status.targetHeatingCoolingState = value
    this.sendUpdate(callback)
  }

  sendUpdate (callback) {
    let daikin = this
    let irCommand

    if (this.status.heatingCoolingState === 'off') {
      irCommand = 'off'
    } else {
      irCommand = `${this.status.targetTemperature}c-${this.status.targetHeatingCoolingState}-${this.status.targetFanSpeed}`
    }

    console.log('sending ir request - ' + irCommand)

    nodeLIRC.irsend.sendOnce('daikin-ARC452A4', irCommand, (err, data) => {
      if (err) {
        console.error(err)
        console.error(`Failed to send command. Is Lirc configured?`)
      }
      callback(daikin.status)
    })
  }

}

module.exports = Daikin
