'use strict'

const chalk = require('chalk')
const config = require('../config')

module.exports = () => {
  console.log('Scan this code with your HomeKit App on your iOS device to pair with HomeKit IR Controller:')
  console.log(chalk.black.bgWhite('                             '))
  console.log(chalk.black.bgWhite('                             '))
  console.log(chalk.black.bgWhite('       ┌────────────┐        '))
  console.log(chalk.black.bgWhite('       │ ' + config.get('pincode') + ' │        '))
  console.log(chalk.black.bgWhite('       └────────────┘        '))
  console.log(chalk.black.bgWhite('                             '))
  console.log(chalk.black.bgWhite('                             '))
}
