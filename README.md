# Daikin IR Controller - ARC452A4

An IR Controller for Daikin Remote ARC452A4 and possibly other smart AC remotes.

This project has been created to intergrate my Daikin AC unit with [Apple Homekit](http://www.apple.com/au/ios/home/) via [Homebridge](https://github.com/oznu/homebridge-daikin-ir-controller). This allows me to control the temperature of my home using my iPhone and Siri.

# Compatibility

This will *probably* only work on systems that support the Daikin Remote ARC452A4 remote control, but it may be possible to learn other remotes, see below.

Your system must have lirc installed and an infrared emitter configured. [This Guide](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/) shows the how to use a RaspberryPi and Lirc.

# Setup

Add the ```daikin-ARC452A4.conf``` file to the /etc/lirc/lircd.conf:

```
include "/path/to/daikin-ir-controller/ac-ir-controller.conf"
```

Restart Lirc:

```
sudo /etc/init.d/lirc restart
```

Test this is working:

```
irsend SEND_ONCE daikin-ARC452A4 off
```

# Usage

Run the server:

```
node bin/www
```

## API Methods

There are three API methods:

* Get Status
* Set Mode
* Set Temperature

### Get Status

```http
GET /status
```

### Set Mode/State

```http
GET /set-state/off
GET /set-state/heat
GET /set-state/cool
GET /set-state/auto
```

### Set Temperature

```http
GET /set-temperature/22
```

*Note If the requested temperature is outside the allowed range it will automatically be set the the lowest or highest temperature allowed for the current mode. For example, if you try and cool to 12° but the AC unit can only cool to 18°, the temperature will be set to 18°. Similarly if you try and cool to 50° but the AC unit can only cool to 30° the temperature will set to 30°. The HTTP response will show the **targetTemperature** that was set.*

### Response

All methods return the current status as JSON:

```json
{
  "currentTemperature":25,
  "currentHumidity":29,
  "targetTemperature":24,
  "mode":"off"
}
```

# Temperature and Humidity Sensor

This module supports the DHT11, DHT22 and AM2302 temperature and humidity sensors.

To enable temperature and humidity the [BCM2835](http://www.airspayce.com/mikem/bcm2835/) library that must be installed on your board.

To install BCM2835:

```
wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz
tar zxvf bcm2835-1.46.tar.gz
cd bcm2835-1.46
./configure
make
sudo make check
sudo make install
```

Once installed add the [node-dht-sensor](https://github.com/momenso/node-dht-sensor) module using npm:

```
npm install node-dht-sensor
```

Then run the server with the ```--dht``` flag:

> **BCM2835** requires access to **/dev/mem** so you will need to run this service as **root** using **sudo**.

```
sudo node bin/www --dht --sensorType 11 --sensorGpio 4
```

You should use sensorType value to match the sensor as follows:

| Sensor          | sensorType value |
|-----------------|:----------------:|
| DHT11           | 11               |
| DHT22 or AM2302 | 22               |

# Recording Remote Control Signals

Many AC units come with *smart* remotes that send the entire configuration each time a button is pressed on the remote. Not like the TV remote which sends static signals (say Volume UP for example). To add to the complexity AC units do not have a standard IR protocol and the signals sent differ between manufacturers and even between models by the same manufacturer.

There are a few guides on the internet that explain how to decode the signals for certain remotes and figure out what part of the payload does what. This project does not attempt to do that, instead it takes the easy approach and just records the signal for the commonly used configuration combinations.

The supported combinations are *Auto*, *Cool*, *Heat* as well as *Off* and a target temperature. This means for a temperature range between 18c and 30c we need to record 37 different IR signals, 12 for each of the on states and one for the off state.

The rest of the settings like fan speed and swing/oscillate should be set as desired before recording the signals. Any timers should also be disabled.

## Creating A New Remote

Create a new directory in the remotes folder using the name of your remote.

```
mkdir remotes/<brand-model>
```

Stop Lirc:

```
sudo /etc/init.d/lirc stop
```

While set to **OFF** configure the AC controller to *Cool* mode on the lowest temperature start recording then press the **ON** button:

```
mode2 -d /dev/lirc0 -m > remotes/<brand-model>/18c-cool
```

Wait about a second then cancel the process. Check the contents of ```remotes/<brand-model>/18c-cool```, it should contain the IR codes for that mode/temperature combination.

Repeat this process for all the temperatures up to the maximum available on *Cool* mode. Then repeat the process for *Heat* and *Auto* modes.

Record the *Off* command by recording the signal sent when you turn the remote off:

```
mode2 -d /dev/lirc0 -m > remotes/<brand-model>/off
```

Once complete, start up the lirc process again:

```
sudo /etc/init.d/lirc start
```

## Building The Remote Config File

Once you have recorded all the signals for your new remote, update the **ac-ir-controller.conf** file by running:

```
./generate-lircd.conf.js
```

 Restart lirc every time you make a change to the *ac-ir-controller.conf* file.

 ```
 sudo /etc/init.d/lirc restart
 ```

## Starting the server with a custom remote

Use the ```--remote``` flag with the name of your remote.

```
./bin/www --remote daikin-ARC452A4
```

# Running in Docker

You still need to configure Lirc on the host OS and pass through the device.

```
 docker run --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 oznu/rpi-daikin-ir-controlle
```
