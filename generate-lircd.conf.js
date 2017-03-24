#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const commands = fs.readdirSync('./ir-codes')

const rawCodes = commands.map((command) => {
  // load in each ir file.
  var code = fs.readFileSync(path.resolve('./ir-codes', command), 'utf8')

  // remove the first two lines from each
  code = code.split('\n')
  code.splice(0, 2)

  // add indent
  code = code.map((line) => {
    return '        ' + line
  })

  // add name of command
  code.unshift('        name ' + command)

  code = code.join('\n')

  return code
})

const bootstrap = `begin remote

  name  daikin-ARC452A4
  flags RAW_CODES
  eps            30
  aeps          100

  gap          34899

      begin raw_codes

${rawCodes.join('\n\n')}

      end raw_codes

end remote`

// output
fs.writeFile('./daikin-ARC452A4.conf', bootstrap, (err, done) => {
  if (err) {
    console.error(err)
  }
})
