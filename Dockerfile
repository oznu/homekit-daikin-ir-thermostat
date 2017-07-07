# Usage: docker run -d --net=host --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 -v /local/path:/app/persist oznu/rpi-daikin-ir-controller
FROM resin/raspberry-pi-node:6.10

RUN mkdir /app
ADD package.json /app/

RUN apt-get update -y \
  && apt-get install -y lirc libnss-mdns avahi-discover libavahi-compat-libdnssd-dev \
  # Install BCM2835 for DHT11 Sensor Support
  && curl -SLO "http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz" \
  && tar -zxvf bcm2835-1.46.tar.gz \
  && cd bcm2835-1.46 \
  && ./configure \
  && make \
  && make install \
  && rm -rf /tmp/* \
  && cd /app \
  && npm install --production \
  && npm install node-dht-sensor \
  # Cleanup
  && apt-get remove python make gcc g++ build-essential \
  && apt-get autoremove \
  && apt-get clean \
  # Install S6 Overlay
  && curl -L -s https://github.com/just-containers/s6-overlay/releases/download/v1.19.1.1/s6-overlay-armhf.tar.gz | tar xvzf - -C /

ADD . /app/
WORKDIR /app

COPY dockerfs /

ENTRYPOINT [ "/init" ]
