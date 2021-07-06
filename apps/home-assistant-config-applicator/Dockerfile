FROM alpine:3.12.0

# Setup base
RUN apk add --no-cache \
    jq \ 
    curl \
    git \
    openssh-client \ 
    bash \
    rsync

WORKDIR /
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

CMD [ "/entrypoint.sh" ]
