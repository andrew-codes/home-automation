FROM node:16.15.0-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git \
    jq
WORKDIR /
COPY . .
RUN NODE_ENV=production yarn install --production --no-lockfile
RUN yarn global add playactor
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["/entrypoint.sh"]