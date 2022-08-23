FROM node:16.15.1-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git \
    jq
WORKDIR /app
COPY dist dist
COPY entrypoint.sh entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]