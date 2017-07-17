# HomeKit Thermostat - Daikin IR Controller - ARC452A4

This project has been created to intergrate my Daikin AC unit with [Apple Homekit](http://www.apple.com/au/ios/home/). This allows me to control the temperature of my home using my iPhone and Siri.

* [Setting Up](#setup)
* [Usage](#usage)
* [REST API](docs/API.md)
* [Setting up Temperature and Humidity Sensor](docs/DHT.md)
* [Learning Custom Remotes](docs/REMOTES.md)
* [Running in Docker](docs/DOCKER.md)

## Compatibility

This will *probably* only work on systems that support the Daikin Remote ARC452A4 remote control, but it may be possible to [learn other remotes](docs/REMOTES.md).

Your system must have lirc installed and an infrared emitter configured. [This Guide](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/) shows the how to use a RaspberryPi and Lirc.

## Setup

Build a ```lircd.conf``` file and copy this to ```/etc/lirc/lircd.conf```:

```
./bin/init
```

Restart Lirc:

```
sudo /etc/init.d/lirc restart
```

Test this is working:

```
irsend SEND_ONCE daikin-arc452a4 off
```

## Usage

Run the server:

```
node bin/www
```

You can now add the thermostat accessory in HomeKit. See https://support.apple.com/en-la/HT204893

The accessory pin code will be displayed in the console.
