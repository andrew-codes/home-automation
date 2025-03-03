FROM node:20.15.0-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY dist dist
ENTRYPOINT ["node", "dist/index.js"]
