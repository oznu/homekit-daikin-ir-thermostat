#!/bin/sh

/etc/init.d/lirc start

exec "$@"
