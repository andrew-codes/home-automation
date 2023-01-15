FROM node:18.12.1-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY dist dist
RUN yarn global add playactor
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["node", "dist/index.js"]
