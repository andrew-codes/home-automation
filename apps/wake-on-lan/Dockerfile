FROM node:18.12.1-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    jq

WORKDIR /app
COPY . .
COPY package.json package.json.temp
RUN jq '.dependencies |= with_entries( select( .key | startswith("@ha/") | not)) | .devDependencies|=with_entries( select( .key | startswith("@ha/") |not ))' package.json.temp >package.json
RUN yarn install --production
ENTRYPOINT ["/app/entrypoint.sh"]
