FROM node:18.12.1-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY dist dist
RUN yarn global add playactor
RUN yarn global add shelljs@^0.8.5
RUN yarn add shelljs@^0.8.5
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["node", "dist/index.js"]
