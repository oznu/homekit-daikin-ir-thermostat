# Usage: docker run -p 3003:3003 --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 oznu/rpi-daikin-ir-controller

FROM resin/raspberry-pi-node:6.10

RUN apt-get update && apt-get install -y \
  lirc \
  libnss-mdns \
  avahi-discover \
  libavahi-compat-libdnssd-dev

WORKDIR /tmp

# Install BCM2835 for DHT11 Sensor Support
RUN curl -SLO "http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz" \
    && tar -zxvf bcm2835-1.46.tar.gz \
    && cd bcm2835-1.46 \
    && ./configure \
    && make \
    && make install \
    && rm -rf /tmp/*

# Add Module
RUN mkdir /app
WORKDIR /app

ADD package.json /app/
RUN npm install --production
RUN npm install node-dht-sensor

RUN echo "include \"/app/ac-ir-controller.conf\"" > /etc/lirc/lircd.conf
ADD init.d/hardware.conf /etc/lirc/hardware.conf
RUN mkdir -p /var/run/lirc

ADD . /app/

EXPOSE 3003

RUN mkdir /init.d
COPY init.d/ /init.d
ENTRYPOINT ["/init.d/entrypoint.sh"]

CMD ["bin/www", "--dht"]
