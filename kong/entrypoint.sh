#!/bin/sh
sed -i "s/KONG_SECRET_PLACEHOLDER/${KONG_SECRET}/g" /etc/kong/kong.yml
exec /docker-entrypoint.sh kong docker-start
