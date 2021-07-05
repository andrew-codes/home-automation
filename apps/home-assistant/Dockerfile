FROM homeassistant/home-assistant:2021.6.6
RUN mkdir -p /home-assistant
COPY ./entrypoint.sh /entrypoint.sh
RUN apk --no-cache add sudo
ENTRYPOINT ["/entrypoint.sh"]