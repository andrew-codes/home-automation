FROM node:16.4.0-alpine AS builder
WORKDIR /app
COPY package.json package.json
RUN --mount=type=cache,source=../../.yarn-cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --ignore-scripts --no-lockfile
ENV NODE_ENV production
COPY . .
RUN yarn compile

# Production image, copy all the files and run next
FROM node:16.4.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV DEBUG @ha/captive-portal*
ENV PORT 80

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY entrypoint.sh ./entrypoint.sh
COPY next.config.js ./
# COPY src/public ./src/public
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
RUN --mount=type=cache,source=.yarn-cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --ignore-scripts --no-lockfile

USER nextjs
EXPOSE 80

ENV NEXT_TELEMETRY_DISABLED 1
