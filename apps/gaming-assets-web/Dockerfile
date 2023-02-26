FROM node:18.12.1
ENV NODE_ENV=production

RUN apt-get update
RUN apt-get install -y \
    build-essential \
    python3 \
    git \
    libvips-dev libvips \
    fftw-dev libwebp-dev

WORKDIR /app
COPY dist dist
COPY dist/package.json package.json
RUN yarn --no-lockfile --production
RUN yarn global add node-gyp@latest
RUN yarn global add sharp@0.31.3
ENTRYPOINT ["node", "dist/index.js"]
