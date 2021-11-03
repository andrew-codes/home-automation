FROM homeassistant/home-assistant:2021.10.7
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