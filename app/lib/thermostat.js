'use strict'

const config = require('./config')
const exec = require('child_process').exec
const dht = config.get('dht') ? require('node-dht-sensor') : null

class Thermostat {

  constructor () {
    this.remote = config.get('remote')
    this.irsend = config.get('irsend')
    this.irsendCount = config.get('irsendCount')

    this.dht = {
      sensorType: config.get('sensorType'),
      sensorGpio: config.get('sensorGpio')
    }

    this.minCoolTemp = parseInt(config.get('minCoolTemp'))
    this.maxCoolTemp = parseInt(config.get('maxCoolTemp'))
    this.minHeatTemp = parseInt(config.get('minHeatTemp'))
    this.maxHeatTemp = parseInt(config.get('maxHeatTemp'))
    this.minAutoTemp = parseInt(config.get('minAutoTemp'))
    this.maxAutoTemp = parseInt(config.get('maxAutoTemp'))

    this.lowerTempLimit = Math.min(this.minAutoTemp, this.minHeatTemp, this.minCoolTemp)
    this.upperTempLimit = Math.max(this.maxAutoTemp, this.maxHeatTemp, this.maxCoolTemp)

    this.status = {}
    this.status.currentTemperature = 20
    this.status.currentHumidity = 0
    this.status.targetTemperature = config.get('defaultTemp')
    this.status.mode = config.get('defaultState')

    exec(`command -v ${this.irsend}`, (commandErr) => {
      if (commandErr) {
        console.error('WARNING: irsend not found in path. Is LIRC installed?')
      } else {
        exec(`${this.irsend} LIST ${this.remote} ""`, (remoteErr) => {
          if (remoteErr) {
            console.error(`WARNING: irsend remote ${this.remote} not found in lirc config!`)
            console.error(`Make sure you have included the "ac-ir-controller.conf" file in /etc/lirc/lircd.conf`)
          }
        })
      }
    })
  }

  getStatus (callback) {
    callback(null, this.status)
  }

  getSensorData (callback) {
    if (config.get('dht')) {
      dht.read(this.dht.sensorType, this.dht.sensorGpio, (err, temperature, humidity) => {
        if (err) {
          console.error(err)
          callback(err)
        } else {
          console.log(`Read Temp: ${temperature}`)
          this.status.currentTemperature = temperature
          this.status.currentHumidity = humidity
          callback(null, this.status)
        }
      })
    } else {
      callback(null, this.status)
    }
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
    let irCommand

    if (this.status.mode === 'off') {
      irCommand = 'off'
    } else {
      irCommand = `${this.status.targetTemperature}c-${this.status.mode}`
    }

    console.log(`Sending ir request using ${this.remote}: ${irCommand}`)

    exec(`${this.irsend} --count=${this.irsendCount} SEND_ONCE ${this.remote} ${irCommand}`, (err) => {
      if (err) {
        console.error(err.message)
        console.error(`Failed to send command. Is LIRC configured?`)
      }
      callback(null, this.status)
    })
  }

}

module.exports = new Thermostat()
