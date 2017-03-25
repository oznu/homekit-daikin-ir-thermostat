'use strict'

// const nodeLIRC = require('node-lirc')

// nodeLIRC.init()

const config = require('./config')

class Daikin {

  constructor () {
    this.remote = config.get('remote')

    this.minCoolTemp = parseInt(config.get('minCoolTemp'))
    this.maxCoolTemp = parseInt(config.get('maxCoolTemp'))
    this.minHeatTemp = parseInt(config.get('minHeatTemp'))
    this.maxHeatTemp = parseInt(config.get('maxHeatTemp'))
    this.minAutoTemp = parseInt(config.get('minAutoTemp'))
    this.maxAutoTemp = parseInt(config.get('maxAutoTemp'))

    this.lowerTempLimit = Math.min(this.minAutoTemp, this.minHeatTemp, this.minCoolTemp)
    this.upperTempLimit = Math.max(this.minAutoTemp, this.minHeatTemp, this.minCoolTemp)

    this.status = {}
    this.status.currentTemperature = 25
    this.status.targetTemperature = config.get('defaultTemp')
    this.status.mode = config.get('defaultState')
  }

  getStatus (callback) {
    callback(null, this.status)
  }

  setTargetTemperature (value, callback) {
    this.status.targetTemperature = this.validateTemp(value)
    this.sendUpdate(callback)
  }

  setTargetState (value = 'off', callback) {
    this.status.mode = value
    this.status.targetTemperature = this.validateTemp(this.status.targetTemperature)
    this.sendUpdate(callback)
  }

  validateTemp (value) {
    value = parseInt(value)
    if (this.status.mode === 'heat') {
      if (value <= this.maxHeatTemp && value >= this.minHeatTemp) {
        return value
      } else {
        if (value > this.maxHeatTemp) {
          return this.maxHeatTemp
        } else if (value < this.minHeatTemp) {
          return this.minHeatTemp
        }
      }
    } else if (this.status.mode === 'cool') {
      if (value <= this.maxCoolTemp && value >= this.minCoolTemp) {
        return value
      } else {
        if (value > this.maxCoolTemp) {
          return this.maxCoolTemp
        } else if (value < this.minCoolTemp) {
          return this.minCoolTemp
        }
      }
    } else if (this.status.mode === 'auto') {
      if (value <= this.maxAutoTemp && value >= this.minAutoTemp) {
        return value
      } else {
        if (value > this.maxAutoTemp) {
          return this.maxAutoTemp
        } else if (value < this.minAutoTemp) {
          return this.minAutoTemp
        }
      }
    } else if (this.status.mode === 'off') {
      if (value <= this.upperTempLimit && value >= this.lowerTempLimit) {
        return value
      } else {
        if (value > this.upperTempLimit) {
          return this.upperTempLimit
        } else if (value < this.lowerTempLimit) {
          return this.lowerTempLimit
        }
      }
    }
  }

  sendUpdate (callback) {
    let daikin = this
    let irCommand

    if (this.status.mode === 'off') {
      irCommand = 'off'
    } else {
      irCommand = `${this.status.targetTemperature}c-${this.status.mode}`
    }

    console.log(`Sending ir request using ${this.remote}: ${irCommand}`)
    console.log(this.remote)
    callback(null, daikin.status)

    // nodeLIRC.irsend.sendOnce(config.get('remote'), irCommand, (err, data) => {
    //   if (err) {
    //     console.error(err)
    //     console.error(`Failed to send command. Is Lirc configured?`)
    //   }
    //   callback(null, daikin.status)
    // })
  }

}

module.exports = Daikin
