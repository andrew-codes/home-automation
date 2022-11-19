FROM node:18.12.1-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
build-base \
gcc \
git \
jq
WORKDIR /app
COPY dist /app/dist
ENTRYPOINT ["node", "dist/index.js"]
