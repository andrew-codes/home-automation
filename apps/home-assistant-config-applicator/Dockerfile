FROM alpine:3.12.0

# Setup base
RUN apk add --no-cache \
    jq \ 
    curl \
    git \
    openssh-client \ 
    bash \
    rsync

# Home Assistant CLI
RUN curl -Lso /usr/bin/ha "https://github.com/home-assistant/cli/releases/download/4.9.0/ha_amd64"
RUN chmod +x /usr/bin/ha

WORKDIR /
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

CMD [ "/entrypoint.sh" ]
