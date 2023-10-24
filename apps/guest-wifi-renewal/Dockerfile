FROM node:18.12.1-alpine
ENV NODE_ENV production

RUN apk add curl

WORKDIR /app
COPY dist dist
ENTRYPOINT ["node", "dist/index.js"]
