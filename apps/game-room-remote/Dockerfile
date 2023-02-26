FROM node:18.12.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

COPY dist dist
RUN mv dist/package.json package.json
RUN yarn --no-lockfile --production

EXPOSE 80

ENTRYPOINT [ "yarn", "remix-serve", "dist" ]
