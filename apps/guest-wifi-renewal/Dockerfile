FROM node:15.3.0-alpine
WORKDIR /app
ENV NODE_ENV production
COPY . .
ENTRYPOINT ["node", "dist/index.js"]