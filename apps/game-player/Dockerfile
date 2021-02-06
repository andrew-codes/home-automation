FROM node:15.3.0-alpine
ENV NODE_ENV production
RUN apt-get install -y jq
WORKDIR /app
COPY . .
RUN cat package.json | jq 'del(.devDependencies)' > package.json
RUN yarn install --production=true
ENTRYPOINT ["node", "server.js"]
