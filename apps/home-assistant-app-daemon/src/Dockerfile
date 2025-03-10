FROM alpine:3.18

ARG OWNER
ARG REPO
LABEL org.opencontainers.image.source=https://github.com/$OWNER/$REPO

RUN apk add --no-cache \
    rsync

COPY ./src/apps /opt/apps/
