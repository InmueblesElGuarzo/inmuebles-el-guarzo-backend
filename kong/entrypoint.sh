#!/bin/sh
# key-auth autogenera la key si queda vacía: sin el secreto, Kong rechazaría todo en silencio
if grep -q ORIGIN_VERIFY_PLACEHOLDER /etc/kong/kong.yml && [ -z "${ORIGIN_VERIFY_SECRET}" ]; then
  echo "ORIGIN_VERIFY_SECRET no está definido" >&2
  exit 1
fi
sed -i "s/KONG_SECRET_PLACEHOLDER/${KONG_SECRET}/g" /etc/kong/kong.yml
sed -i "s/ORIGIN_VERIFY_PLACEHOLDER/${ORIGIN_VERIFY_SECRET}/g" /etc/kong/kong.yml
exec /docker-entrypoint.sh kong docker-start
