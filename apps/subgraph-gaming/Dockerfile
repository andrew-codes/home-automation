FROM node:18.12.1-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY entrypoint.sh entrypoint.sh
COPY dist dist
ENTRYPOINT ["node", "dist/index.js"]
