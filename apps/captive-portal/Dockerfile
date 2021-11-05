FROM node:16.4.0-alpine AS builder
WORKDIR /app
COPY package.json package.json
RUN yarn install --ignore-scripts --no-lockfile
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
COPY --chown=nextjs:nodejs dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 80

ENV NEXT_TELEMETRY_DISABLED 1