FROM jakowenko/double-take:1.7.0
RUN apt-get update
RUN apt-get install -y gettext-base

COPY ./config.yml /config.yml
COPY start.sh /start.sh

CMD ["/bin/sh" "-c" "/start.sh"]