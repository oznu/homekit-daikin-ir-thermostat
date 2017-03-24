'use strict'

const router = require('express').Router()
const ctrl = require('./controller')

router.get('/status', ctrl.status)
router.get('/set-temperature/:temp(\\d+)', ctrl.setTargetTemperature)
router.get('/set-state/:state(off|cool|heat|auto)', ctrl.setTargetState)

module.exports = router
