'use strict'

const fs = require('fs')
const Bluebird = require('bluebird')
const spawn = require('child_process').spawn
const EventEmitter = require('events')

const config = require('./lib/config')
const remotes = require('./remotes.json')

class Record extends EventEmitter {
  constructor () {
    super()
    this.raw = []
    this.timeout = null

    this.mode2 = spawn('mode2', ['-d', '/dev/lirc0', '-m'])

    this.mode2.stdout.on('data', (data) => {
      this.raw.push(data.toString())

      process.stdout.write('...')

      clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        this.isEol(this.raw)
      }, 1000)
    })

    this.mode2.stderr.on('data', (data) => {
      console.error(data.toString())
    })
  }

  isEol (data) {
    process.stdout.write('\n')
    data = data.join('').split('\n\n')
    data.splice(0, 1)

    if (data.length) {
      this.mode2.kill()
      this.emit('recorded', null, data[0])
    };
  }
}

class Learn {
  constructor (remote) {
    this.remote = remote
    this.dest = `./remotes/${this.remote.manufacturer.toLowerCase()}-${this.remote.model.toLowerCase()}.conf`
    this.states = [{
      key: 'off',
      mode: 'off',
      temp: 0
    }]

    Object.keys(remote.modes).forEach((mode) => {
      let range = this.getRange(remote.modes[mode].min, remote.modes[mode].max)
      range.forEach((temp) => {
        this.states.push({
          key: `${mode}-${temp}c`,
          mode: mode,
          temp: temp
        })
      })
    })
  }

  start () {
    return Bluebird.mapSeries(this.states, (state) => {
      return new Bluebird((resolve, reject) => {
        console.log(`Press button to record ${state.key}`)
        let record = new Record()
        record.once('recorded', (err, data) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        })
      })
      .then((data) => {
        state.code = data
      })
    }, {concurrency: 1})
    .then((results) => {
      return this.genLirc()
    })
  }

  genLirc () {
    let commands = this.states.map((state) => {
      let code = state.code.split('\n')
      code = code.map(x => '        ' + x)
      code.unshift('        name ' + state.key)
      code = code.join('\n')
      return code
    })

    commands = commands.join('\n\n')

    let lircConf = `begin remote\n` +
      `  name  ${this.remote.manufacturer.toLowerCase()}-${this.remote.model.toLowerCase()}\n` +
      `  flags RAW_CODES\n` +
      `  eps            30\n` +
      `  aeps          100\n\n` +
      `  gap          34899\n\n` +
      `      begin raw_codes\n\n` +
      `${commands}\n\n` +
      `      end raw_codes\n` +
      `end remote\n`

    console.log(`Saved remote to ${this.dest}`)
    return fs.writeFileSync(this.dest, lircConf)
  }

  getRange (start, end) {
    return Array.from({length: ((end + 1) - start)}, (v, k) => k + start)
  }
}

let learn = new Learn(remotes[config.get('remote')])

learn.start()
