FROM node:16.4.0-alpine
ENV NODE_ENV=production

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git \
    jq
WORKDIR /
COPY . .
COPY package.json package.json.temp
RUN jq '.dependencies |= with_entries( select( .key | startswith("@ha/") | not)) | .devDependencies|=with_entries( select( .key | startswith("@ha/") |not ))' package.json.temp > package.json
RUN yarn install --production
RUN mkdir -p ~/.config/playactor
ENTRYPOINT ["/entrypoint.sh"]