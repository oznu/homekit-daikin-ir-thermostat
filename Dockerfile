# Usage: docker run -d --net=host --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 -v /local/path:/app/persist oznu/rpi-daikin-ir-controller
FROM resin/raspberry-pi-node:6.10-slim

RUN mkdir /app
COPY app/package.json /app/

RUN apt-get update -y \
  && apt-get install -y lirc libnss-mdns avahi-discover libavahi-compat-libdnssd-dev python build-essential curl \
  # Install BCM2835 for DHT11 Sensor Support
  && curl -SLO "http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz" \
  && tar -zxvf bcm2835-1.46.tar.gz \
  && cd bcm2835-1.46 \
  && ./configure \
  && make \
  && make install \
  && rm -rf /tmp/* \
  # Install app deps
  && cd /app \
  && npm install --production \
  && npm install node-dht-sensor \
  # Install S6 Overlay
  && curl -L -s https://github.com/just-containers/s6-overlay/releases/download/v1.19.1.1/s6-overlay-armhf.tar.gz | tar xvzf - -C / \
  # Cleanup
  && apt-get remove python build-essential curl \
  && apt-get autoremove \
  && apt-get clean

COPY app /app
WORKDIR /app

COPY dockerfs /

ENTRYPOINT [ "/init" ]
