FROM node:16.4.0-alpine

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git
WORKDIR /
COPY . .
RUN yarn add tsconfig-paths
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["/entrypoint.sh"]