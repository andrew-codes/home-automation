# Production image, copy all the files and run next
FROM node:16.15.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV DEBUG @ha/captive-portal*
ENV PORT 80

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY entrypoint.sh entrypoint.sh
COPY next.config.js next.config.js
# COPY src/public ./src/public
COPY --chown=nextjs:nodejs dist dist
COPY package.json package.json
RUN yarn --ignore-scripts --no-lockfile

USER nextjs

EXPOSE 80

ENV NEXT_TELEMETRY_DISABLED 1
