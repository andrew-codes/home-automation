FROM node:18.12.1-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git \
    jq
WORKDIR /app
COPY entrypoint.sh entrypoint.sh
COPY dist dist
COPY dist/package.json package.json
RUN NODE_ENV=production yarn install --production
ENTRYPOINT ["/app/entrypoint.sh"]
