FROM node:18.12.1-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
build-base \
gcc \
git \
jq
WORKDIR /app
COPY dist dist
COPY package.json package.json.temp
RUN jq '.dependencies |= with_entries( select( .key | startswith("@ha/") | not)) | .devDependencies|=with_entries( select( .key | startswith("@ha/") |not ))' package.json.temp >package.json
RUN NODE_ENV=production yarn install --production
ENTRYPOINT ["node", "dist/index.js"]
