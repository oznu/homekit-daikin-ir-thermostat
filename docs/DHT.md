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
