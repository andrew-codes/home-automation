FROM node:16.4.0-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git \
    jq
WORKDIR /
COPY . .
COPY package.json package.json.temp
RUN jq 'del(.dependencies."@ha/mqtt-client")' package.json.temp | jq 'del(.devDependencies."@ha/ts-config")' > package.json
RUN yarn install --production
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["/entrypoint.sh"]