FROM homeassistant/home-assistant:2021.6.6
RUN mkdir -p /home-assistant
RUN apk --no-cache add \
    rsync \
    sudo
COPY ./entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]