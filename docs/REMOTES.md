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
