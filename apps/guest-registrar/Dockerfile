FROM node:16.15.0-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git \
    jq
WORKDIR /app
COPY . .
COPY package.json package.json.temp
RUN jq '.dependencies |= with_entries( select( .key | startswith("@ha/") | not)) | .devDependencies|=with_entries( select( .key | startswith("@ha/") |not ))' package.json.temp > package.json
RUN NODE_ENV=production yarn install --production
ENTRYPOINT ["/app/entrypoint.sh"]