FROM node:22.14.0-alpine
ENV NODE_ENV=production

ARG OWNER
ARG REPO
LABEL org.opencontainers.image.source=https://github.com/$OWNER/$REPO

WORKDIR /app
COPY dist dist
ENTRYPOINT ["node", "dist/index.js"]
