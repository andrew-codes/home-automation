FROM homeassistant/home-assistant:2021.11.2
RUN apk --no-cache add \
    bash \
    curl \
    net-snmp-tools \
    sudo \
    rsync \
    yarn
COPY ./entrypoint.sh /entrypoint.sh
RUN yarn global add chokidar-cli
WORKDIR /config
ENTRYPOINT ["/entrypoint.sh"]