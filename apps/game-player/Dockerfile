FROM node:15.3.0-alpine
ENV NODE_ENV production
WORKDIR /app
COPY . .
WORKDIR /app/dist
RUN yarn install --production=true
ENTRYPOINT ["node", "server.js"]
