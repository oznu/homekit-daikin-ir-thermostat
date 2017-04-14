'use strict'

const EventEmitter = require('events')

const Accessory = require('hap-nodejs').Accessory
const Service = require('hap-nodejs').Service
const Characteristic = require('hap-nodejs').Characteristic
const uuid = require('hap-nodejs').uuid

const config = require('../config')
const thermostat = require('../thermostat')

class ThermostatAccessory extends EventEmitter {
  constructor () {
    super()

    this.name = config.get('name')
    this.sensorUUID = uuid.generate('hap-nodejs:accessories:ir-ac-ctrl:thermostat')
    this.accessory = new Accessory('Thermostat', this.sensorUUID)
    this.service = this.accessory.addService(Service.Thermostat)

    this.username = config.get('username')
    this.pincode = config.get('pincode')

    this.thermostat = thermostat

    // accept input from the web, this keeps homekit and http in sync
    this.on('setTargetTemperature', (value) => {
      this.service.setCharacteristic(Characteristic.TargetTemperature, value)
    })

    this.on('setTargetState', (value) => {
      this.service.setCharacteristic(Characteristic.TargetHeatingCoolingState, this.getThermostatStateId(value))
    })

    // set interval to update the temp and humidity
    setInterval(this.getSensorData.bind(this), 60000)
  }

  getName (callback) {
    console.log('Called getName')
    callback(null, this.name)
  }

  getThermostatStateId (label) {
    switch (label) {
      case 'cool':
        return Characteristic.TargetHeatingCoolingState.COOL
      case 'heat':
        return Characteristic.TargetHeatingCoolingState.HEAT
      case 'auto':
        return Characteristic.TargetHeatingCoolingState.AUTO
      case 'off':
        return Characteristic.TargetHeatingCoolingState.OFF
      default:
        return Characteristic.TargetHeatingCoolingState.OFF
    }
  }

  getThermostatStateLabel (id) {
    switch (id) {
      case Characteristic.TargetHeatingCoolingState.COOL:
        return 'cool'
      case Characteristic.TargetHeatingCoolingState.HEAT:
        return 'heat'
      case Characteristic.TargetHeatingCoolingState.AUTO:
        return 'auto'
      case Characteristic.TargetHeatingCoolingState.OFF:
        return 'off'
      default:
        return 'off'
    }
  }

  getStatus () {
    let properties = {
      CurrentHeatingCoolingState: this.getThermostatStateId(this.thermostat.status.mode),
      TargetHeatingCoolingState: this.getThermostatStateId(this.thermostat.status.mode),
      TargetTemperature: this.thermostat.status.targetTemperature,
      CurrentTemperature: this.thermostat.status.currentTemperature,
      CurrentRelativeHumidity: this.thermostat.status.currentHumidity,
      TemperatureDisplayUnits: 0
    }

    // CurrentHeatingCoolingState cannot Be AUTO, determine if we are cooling or heating based on current temp
    if (properties.TargetHeatingCoolingState === Characteristic.TargetHeatingCoolingState.AUTO) {
      if (properties.CurrentTemperature > properties.TargetTemperature) {
        properties.CurrentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.COOL
      } else {
        properties.CurrentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.HEAT
      }
    }

    return properties
  }

  getCurrentHeatingCoolingState (callback) {
    console.log('Called getCurrentHeatingCoolingState')
    callback(null, this.getStatus().CurrentHeatingCoolingState)
  }

  getTargetHeatingCoolingState (callback) {
    console.log('Called getTargetHeatingCoolingState')
    callback(null, this.getStatus().TargetHeatingCoolingState)
  }

  setTargetHeatingCoolingState (value, callback) {
    console.log(`Called setTargetHeatingCoolingState: ${value}`)
    let currentTargetTemperature = this.getStatus().TargetTemperature

    this.thermostat.setTargetState(this.getThermostatStateLabel(value), () => {
      setTimeout(() => {
        // update the CurrentHeatingCoolingState
        this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState,
          this.getStatus().CurrentHeatingCoolingState)
      }, 100)

      if (currentTargetTemperature !== this.getStatus().TargetTemperature) {
        setTimeout(() => {
          // update the TargetTemperature
          this.service.setCharacteristic(Characteristic.TargetTemperature,
            this.getStatus().TargetTemperature)
        }, 100)
      }

      callback(null)
    })
  }

  getTargetTemperature (callback) {
    console.log('Called getTargetTemperature')
    callback(null, this.getStatus().TargetTemperature)
  }

  setTargetTemperature (value, callback) {
    console.log(`Called setTargetTemperature ${value}`)
    this.thermostat.setTargetTemperature(value, () => {
      if (this.getStatus().TargetTemperature !== value) {
        setTimeout(() => {
          this.service.setCharacteristic(Characteristic.TargetTemperature,
          this.getStatus().TargetTemperature)
        }, 100)
      }

      // update the CurrentHeatingCoolingState
      this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState,
        this.getStatus().CurrentHeatingCoolingState)
      callback(null)
    })
  }

  getCurrentTemperature (callback) {
    console.log('Called getCurrentTemperature')
    callback(null, this.getStatus().CurrentTemperature)
  }

  getCurrentRelativeHumidity (callback) {
    console.log('Called getCurrentRelativeHumidity')
    callback(null, this.getStatus().CurrentRelativeHumidity)
  }

  getTemperatureDisplayUnits (callback) {
    console.log(Characteristic.TemperatureDisplayUnits.CELSIUS)
    callback(null, this.getStatus().TemperatureDisplayUnits)
  }

  setTemperatureDisplayUnits (value, callback) {
    console.log('Called setTemperatureDisplayUnits')
    if (this.getStatus().TemperatureDisplayUnits !== value) {
      setTimeout(() => {
        this.accessory.getService(Service.Thermostat)
          .setCharacteristic(Characteristic.TemperatureDisplayUnits, 0)
      }, 100)
    }
    callback(null)
  }

  getSensorData (callback) {
    console.log('Called getSensorData')
    this.thermostat.getSensorData((err, data) => {
      if (!err) {
        this.service.setCharacteristic(Characteristic.CurrentTemperature, data.currentTemperature)
        this.service.setCharacteristic(Characteristic.CurrentRelativeHumidity, data.currentHumidity)
      }
    })
  }

  getServices () {
    this.accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'oznu')
      .setCharacteristic(Characteristic.Model, this.thermostat.remote)
      .setCharacteristic(Characteristic.SerialNumber, 'oznu-ir-thermostat')

    this.service
      .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on('get', this.getCurrentHeatingCoolingState.bind(this))

    this.service
      .getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on('get', this.getTargetHeatingCoolingState.bind(this))
      .on('set', this.setTargetHeatingCoolingState.bind(this))

    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getCurrentTemperature.bind(this))

    this.service
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getCurrentRelativeHumidity.bind(this))

    this.service
      .getCharacteristic(Characteristic.TargetTemperature)
      .on('get', this.getTargetTemperature.bind(this))
      .on('set', this.setTargetTemperature.bind(this))
      .setProps({
        minValue: this.thermostat.lowerTempLimit,
        maxValue: this.thermostat.upperTempLimit,
        minStep: 1
      })

    this.service
      .getCharacteristic(Characteristic.TemperatureDisplayUnits)
      .on('get', this.getTemperatureDisplayUnits.bind(this))
      .on('set', this.setTemperatureDisplayUnits.bind(this))

    this.service
      .getCharacteristic(Characteristic.Name)
      .on('get', this.getName.bind(this))
  }
}

module.exports = new ThermostatAccessory()
