FROM homeassistant/home-assistant:2021.6.6
RUN apk --no-cache add \
    bash \
    curl \
    sudo \
    rsync \
    yarn
COPY ./entrypoint.sh /entrypoint.sh
RUN yarn global add chokidar-cli
WORKDIR /config
ENTRYPOINT ["/entrypoint.sh"]