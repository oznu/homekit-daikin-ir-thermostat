# HomeKit Thermostat - Daikin IR Controller - ARC452A4

This project has been created to intergrate my Daikin AC unit with [Apple Homekit](http://www.apple.com/au/ios/home/). This allows me to control the temperature of my home using my iPhone and Siri.

## Compatibility

This will *probably* only work on systems that support the Daikin Remote ARC452A4 remote control, but it may be possible to [learn other remotes](docs/REMOTES.md).

Your system must have lirc installed and an infrared emitter configured. [This Guide](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/) shows the how to use a RaspberryPi and Lirc.

## Setup


Add the ```daikin-ARC452A4.conf``` file to the /etc/lirc/lircd.conf:

```
include "/path/to/daikin-ir-controller/app/ac-ir-controller.conf"
```

Restart Lirc:

```
sudo /etc/init.d/lirc restart
```

Test this is working:

```
irsend SEND_ONCE daikin-ARC452A4 off
```

* [REST API](docs/API.md)
* [Setting up Temperature and Humidity Sensor](docs/DHT.md)
* [Learning Custom Remotes](docs/REMOTES.md)

## Usage

Run the server:

```
node bin/www
```

You can now add the thermostat accessory in HomeKit. See https://support.apple.com/en-la/HT204893

The accessory pin code will be displayed in the console.


## Running in Docker

This app can run as a Docker Container on Raspbian.

If using this method you should **not** install Lirc on the host, instead you need to setup lirc-rpi in your ```/boot/config.txt``` file like this:

```
dtoverlay=lirc-rpi,gpio_in_pin=23,gpio_out_pin=22
```

```
docker run \
  --net=host \
  --cap-add SYS_RAWIO \
  --device /dev/mem:/dev/mem \
  --device /dev/lirc0:/dev/lirc0 \
  -v </path/to/config>:/app/persist \
  oznu/rpi-daikin-ir-controller
```

### Parameters

The parameters are split into two halves, separated by a colon, the left hand side representing the host and the right the container side.

* ```--net=host``` - Shares host networking with container, required.
* ```-v /app/persist``` - The config and persistent data location.
* ```--cap-add SYS_RAWIO``` - Allows the container to talk to the GPIO pins, required.
* ```--device /dev/mem:/dev/mem``` - Share the /dev/mem device to the container, required if using temperature/humidity sensors.
* ```--device /dev/lirc0:/dev/lirc0``` - Share the lirc device to the container, required.
