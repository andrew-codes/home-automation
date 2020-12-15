FROM node:14.3.0-alpine
WORKDIR /app
ENV DEBUG captive-portal*
ENV NODE_ENV production
COPY . .
ENTRYPOINT ["node", "dist/index.js"]