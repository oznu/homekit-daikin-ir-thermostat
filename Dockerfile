# Usage: docker run -d --net=host --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 -v /local/path:/app/persist oznu/rpi-daikin-ir-controller
FROM resin/raspberry-pi-node:6.10

RUN apt-get update -y \
  && apt-get install -y lirc libnss-mdns avahi-discover libavahi-compat-libdnssd-dev \
  && mkdir /app

# Install BCM2835 for DHT11 Sensor Support
RUN curl -SLO "http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz" \
    && tar -zxvf bcm2835-1.46.tar.gz \
    && cd bcm2835-1.46 \
    && ./configure \
    && make \
    && make install \
    && rm -rf /tmp/*

WORKDIR /app

ADD package.json /app/

RUN npm install --production \
  && npm install node-dht-sensor

ADD . /app/

# s6 overlay
ADD https://github.com/just-containers/s6-overlay/releases/download/v1.19.1.1/s6-overlay-amd64.tar.gz /tmp/s6-overlay.tar.gz
RUN tar xvfz /tmp/s6-overlay.tar.gz -C /

COPY dockerfs /

ENTRYPOINT [ "/init" ]
