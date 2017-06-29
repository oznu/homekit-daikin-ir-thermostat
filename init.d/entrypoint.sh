#!/bin/sh

rm -rf /var/run/dbus/pid
rm -rf /var/run/avahi-daemon/pid

/etc/init.d/lirc start
/etc/init.d/dbus start
/etc/init.d/avahi-daemon start

exec "$@"
