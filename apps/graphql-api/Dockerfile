FROM node:15.3.0-alpine
ENV NODE_ENV production
WORKDIR /app
COPY . .
ENTRYPOINT ["node", "dist/index.js"]
