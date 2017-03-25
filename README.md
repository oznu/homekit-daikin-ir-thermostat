# Daikin IR Controller - ARC452A4

An IR Controller for Daikin Remote ARC452A4.

# Compatibility

This will *probably* only work on systems that support the Daikin Remote ARC452A4 remote control.

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

# Recording Remote Control Signals

Many AC units come with *smart* remotes that send the entire configuration each time a button is pressed on the remote. Not like the TV remote which sends static signals (say Volume UP for example). To add to the complexity AC units do not have a standard IR protocol and the signals sent differ between manufacturers and even between models by the same manufacturer.

There are a few guides on the internet that explain how to decode the signals for certain remotes and figure out what part of the payload does what. This project does not attempt to do that, instead it takes the easy approach and just records the signal for the commonly used configuration combinations.

The supported combinations are *Auto*, *Cool*, *Heat* as well as *Off* and a target temperature. This means for a temperature range between 18c and 30c we need to record 37 different IR signals, 12 for each of the on states and one for the off state.

The rest of the settings like fan speed and swing/oscillate should be set as desired before recording the signals. Any timers should also be disabled.
