# Daikin IR Controller - ARC452A4

An IR Controller for Daikin Remote ARC452A4.

# Compatibility

This will *probably* only work on systems that support the Daikin Remote ARC452A4 remote control.

Your system must have lirc installed and an infrared emitter configured. [This Guide](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/) shows the how to use a RaspberryPi and Lirc.

# Setup

Add the ```daikin-ARC452A4.conf``` file to the /etc/lirc/lircd.conf:

```
include "/change/me/daikin-ir-controller/daikin-ARC452A4.conf"
```

Restart Lirc:

```
sudo /etc/init.d/lirc restart
```

Test this is working:

```
irsend SEND_ONCE daikin-ARC452A4 off
```

### Usage

Run the server:

```
node bin/www
```
