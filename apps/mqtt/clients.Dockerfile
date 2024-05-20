FROM alpine:3.18.3

VOLUME /opt/certs

RUN apk add --no-cache \
    ca-certificates \
    tini \
    mosquitto-clients
RUN /etc/ca-certificates/update.d/certhash
RUN ln -s /usr/bin/mosquitto_pub /usr/local/bin/pub
RUN ln -s /usr/bin/mosquitto_sub /usr/local/bin/sub

USER nobody
ENTRYPOINT [ "/sbin/tini", "--" ]
