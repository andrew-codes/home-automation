FROM blakeblackshear/frigate:stable-amd64

COPY .config.yml /config/config.yml

CMD ["envsubst < /config/config.yml > /config/config.yml", "&&", "/run.sh"]