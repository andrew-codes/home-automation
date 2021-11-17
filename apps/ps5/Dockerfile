FROM node:16.4.0-alpine

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git
WORKDIR /
COPY . .
RUN yarn global add playactor@0.4.0
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["/start.sh"]