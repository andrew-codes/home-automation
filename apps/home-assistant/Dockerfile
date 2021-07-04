FROM homeassistant/home-assistant:2021.6.6
RUN mkdir -p /home-assistant
COPY ./src/ /home-assistant-src
COPY ./entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
RUN apk --no-cache add sudo