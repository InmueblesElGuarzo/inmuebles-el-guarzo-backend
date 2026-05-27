FROM kong:3.9

USER root
COPY kong.yml /etc/kong/kong.yml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER kong

ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/etc/kong/kong.yml
ENV KONG_PROXY_ACCESS_LOG=/dev/stdout
ENV KONG_PROXY_ERROR_LOG=/dev/stderr
ENV KONG_ADMIN_LISTEN=off
ENV KONG_NGINX_WORKER_PROCESSES=1
ENV KONG_MEM_CACHE_SIZE=32m
ENV KONG_PROXY_LISTEN=0.0.0.0:8000

ENTRYPOINT ["/entrypoint.sh"]
