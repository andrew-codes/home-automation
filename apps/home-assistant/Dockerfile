FROM homeassistant/home-assistant:2023.2.5
RUN apk --no-cache add \
    bash \
    curl \
    net-snmp-tools \
    openssh \
    sudo \
    rsync \
    yarn
RUN rc-update add sshd
COPY ./entrypoint.sh /entrypoint.sh
COPY ./dist/sync.sh /sync.sh
COPY ./reload.sh /reload.sh
RUN yarn global add chokidar-cli
WORKDIR /config
ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 22
