FROM ghcr.io/static-web-server/static-web-server:2-alpine

ARG OWNER
ARG REPO
LABEL org.opencontainers.image.source=https://github.com/$OWNER/$REPO

# Set the working directory
WORKDIR /app

COPY ._dist ./public

ENTRYPOINT [ "static-web-server", "--root=/app/public", "--health"]
