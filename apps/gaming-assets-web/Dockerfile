FROM node:18.12.1-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git
WORKDIR /app
COPY dist dist
COPY dist/package.json package.json
COPY entrypoint.sh entrypoint.sh
RUN NODE_ENV=production yarn install --production
ENTRYPOINT ["/app/entrypoint.sh"]
