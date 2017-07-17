# Recording Remote Control Signals

Many AC units come with *smart* remotes that send the entire configuration each time a button is pressed on the remote. Not like the TV remote which sends static signals (say Volume UP for example). To add to the complexity AC units do not have a standard IR protocol and the signals sent differ between manufacturers and even between models by the same manufacturer.

There are a few guides on the internet that explain how to decode the signals for certain remotes and figure out what part of the payload does what. This project does not attempt to do that, instead it takes the easy approach and just records the signal for the commonly used configuration combinations.

The supported combinations are *Auto*, *Cool*, *Heat* as well as *Off* and a target temperature. This means for a temperature range between 18c and 30c we need to record 37 different IR signals, 12 for each of the on states and one for the off state.

The rest of the settings like fan speed and swing/oscillate should be set as desired before recording the signals. Any timers should also be disabled.

## Creating A New Remote

Create a new entry in the ```remotes.json``` file defining the properties of the remote.

```json
"daikin-arc452a4": {
  "manufacturer": "Daikin",
  "model": "ARC452A4",
  "modes": {
    "auto": {
      "min": 18,
      "max": 30
    },
    "heat": {
      "min": 10,
      "max": 30
    },
    "cool": {
      "min": 18,
      "max": 32
    }
  }
}
```

Run the ```recorder.js``` script:

```
node recorder.js --remote daikin-arc452a4
```

You will be prompted to press the button on your remote control for each state and temperature.

## Building The Remote Config File

Once you have recorded all the signals for your new remote, update the **lircd.conf** file by running:

```
./bin/init
```

 Restart lirc every time you make a change to any remote codes.

 ```
 sudo /etc/init.d/lirc restart
 ```

## Starting the server with a custom remote

Use the ```--remote``` flag with the name of your remote.

```
./bin/www --remote daikin-arc452a4
```
