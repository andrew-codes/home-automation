FROM alpine:3.12.0

# Setup base
RUN apk add --no-cache jq curl git openssh-client bash

# Home Assistant CLI
ARG BUILD_ARCH
ARG CLI_VERSION
RUN curl -Lso /usr/bin/ha "https://github.com/home-assistant/cli/releases/download/${CLI_VERSION}/ha_${BUILD_ARCH}"
RUN chmod +x /usr/bin/ha

WORKDIR /app
COPY ./ .
RUN chmod a+x /app/dist/*.sh

CMD [ "/app/dist/entrypoint.sh" ]
