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

### Using Docker Compose

If you prefer to use [Docker Compose](https://docs.docker.com/compose/):

```yaml
version: '2'
services:
  ir-ctrl:
    image: oznu/rpi-daikin-ir-controller
    restart: always
    network_mode: host
    devices:
      - "/dev/mem:/dev/mem"
      - "/dev/lirc0:/dev/lirc0"
    cap_add:
      - SYS_RAWIO
    volumes:
      - "./persist:/app/persist"
```
