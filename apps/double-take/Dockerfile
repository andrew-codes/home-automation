FROM jakowenko/double-take:1.10.1
RUN apt-get update
RUN apt-get install -y gettext-base

COPY ./config.yml /config.yml
COPY entrypoint.sh /entrypoint.sh

CMD ["/bin/sh" "-c" "/entrypoint.sh"]