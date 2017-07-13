# Usage: docker run -d --net=host --cap-add SYS_RAWIO --device /dev/mem:/dev/mem --device /dev/lirc0:/dev/lirc0 -v /local/path:/app/persist oznu/rpi-daikin-ir-controller
FROM oznu/s6-node:6.11.0-armhf

# Build and Install Lirc
RUN apk add --no-cache --virtual .lirc-deps \
  git automake autoconf libtool make gcc g++ python3 \
  python3-dev libxslt py3-yaml linux-headers python3-dev \
  && git clone git://git.code.sf.net/p/lirc/git /tmp/lirc \
  && cd /tmp/lirc \
  && ./autogen.sh \
  && ./configure --prefix=/ \
  && make \
  && make install \
  && cd / \
  && rm -rf /tmp/lirc \
  && apk del .lirc-deps \
  && apk add --no-cache libstdc++ libgcc \
  && mkdir -p /var/run/lirc

COPY app/package.json /app/

# Add deps
RUN apk add --no-cache \
  libffi-dev \
  openssl-dev \
  avahi-compat-libdns_sd \
  avahi-dev \
  dbus

# Build and install packages
RUN apk add --no-cache --virtual .bcm2835-deps \
  git python gcc g++ make curl \
  && curl -SLO "http://www.airspayce.com/mikem/bcm2835/bcm2835-1.46.tar.gz" \
  && tar -zxvf bcm2835-1.46.tar.gz \
  && cd bcm2835-1.46 \
  && ./configure \
  && make \
  && make install \
  && cd .. \
  && rm -rf bcm2835-1.46 \
  && rm -rf /tmp/* \
  && cd /app \
  && yarn global add node-gyp \
  && yarn install --production \
  && yarn add node-dht-sensor \
  && apk del .bcm2835-deps

COPY app /app
WORKDIR /app

ENV S6_KEEP_ENV=1

COPY dockerfs /
