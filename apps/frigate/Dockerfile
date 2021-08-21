FROM blakeblackshear/frigate:stable-amd64
RUN apt-get install -y \
    gettext-base
COPY config.yml /config/config.yml
COPY start.sh /start.sh

CMD ["/start.sh"]