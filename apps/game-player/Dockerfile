FROM node:15.3.0-alpine
ENV NODE_ENV production
WORKDIR /app
COPY . .
RUN yarn install --production=true
ENTRYPOINT ["node", "dist/index.js"]
