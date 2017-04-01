# Usage: docker run --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 oznu/rpi-daikin-ir-controller

FROM resin/rpi-raspbian:latest

RUN apt-get update -y
RUN apt-get install -y apt-utils
RUN apt-get install -y curl build-essential python nano lirc

WORKDIR /tmp

# Install Node LTS
ENV NODE_VERSION 6.10.1
ENV NODE_CHECKSUM e59a5558a6271385fddc5f58f85dfe7bf9b7c73d75ea14d0171266cf90bff830

RUN curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-armv6l.tar.gz" \
    && echo "$NODE_CHECKSUM  node-v$NODE_VERSION-linux-armv6l.tar.gz" | sha256sum -c - \
    && tar -xzf "node-v$NODE_VERSION-linux-armv6l.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VERSION-linux-armv6l.tar.gz" \
    && npm config set unsafe-perm true -g --unsafe-perm \
    && rm -rf /tmp/*

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
RUN mkdir -p /var/run/lirc

ADD . /app/

EXPOSE 3003

CMD ["bin/www", "--dht"]
