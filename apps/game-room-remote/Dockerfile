# Production image, copy all the files and run next
FROM node:16.15.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV DEBUG @ha/game-room-remote*
ENV PORT 80

RUN addgroup -g 1001 -S nodejs
RUN adduser -S app -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY entrypoint.sh entrypoint.sh
COPY --chown=app:nodejs dist dist
COPY package.json package.json
RUN yarn --ignore-scripts --no-lockfile

USER app

EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]