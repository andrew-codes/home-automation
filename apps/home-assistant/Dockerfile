FROM homeassistant/home-assistant:2024.8.3
RUN apk --no-cache add \
    bash \
    curl \
    net-snmp-tools \
    sudo \
    rsync \
    yarn
COPY ./entrypoint.sh /entrypoint.sh
COPY ./dist/sync.sh /sync.sh
COPY ./reload.sh /reload.sh
RUN yarn global add chokidar-cli
WORKDIR /config
ENTRYPOINT ["/entrypoint.sh"]
