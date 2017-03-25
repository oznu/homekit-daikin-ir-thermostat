#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const util = require('util')

const bootstrap = `begin remote
  name  %s
  flags RAW_CODES
  eps            30
  aeps          100

  gap          34899

      begin raw_codes

%s

      end raw_codes
end remote`

class RemoteConf {
  constructor () {
    this.remotes = this.getRemotes()
  }

  getRemotes () {
    return fs.readdirSync('./remotes').map((remote) => {
      let commands = this.getCommands(remote)
      return util.format(bootstrap, remote, commands)
    }).join('\n\n')
  }

  getCommands (remote) {
    let commands = fs.readdirSync(path.resolve('./remotes/', remote))

    return commands.map((command) => {
      // load in each ir file.
      var code = fs.readFileSync(path.resolve('./remotes', remote, command), 'utf8')

      // remove the first two lines from each
      code = code.split('\n')
      code.splice(0, 2)

      // add indent
      code = code.map((line) => {
        return '        ' + line
      })

      // add name of command
      code.unshift('        name ' + command)

      return code.join('\n')
    }).join('\n\n')
  }

  save () {
    return fs.writeFileSync('./ac-ir-controller.conf', this.remotes)
  }
}

const conf = new RemoteConf()

conf.save()
