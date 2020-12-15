ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine
WORKDIR /app
COPY dist ./
ENTRYPOINT ["node", "index.js"]