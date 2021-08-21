FROM blakeblackshear/frigate:stable-amd64
RUN apt-get update -y
RUN apt-get install -y \
    gettext-base \
    usbutils
COPY config.yml /config/config-raw.yml
COPY start.sh /start.sh

CMD ["/start.sh"]