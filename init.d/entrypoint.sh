#!/bin/sh

/etc/init.d/lirc start

rm -rf /var/run/dbus/pid
rm -rf /var/run/avahi-daemon/pid

dbus-daemon --system
avahi-daemon -D

exec "$@"
