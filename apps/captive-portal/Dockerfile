FROM node:18.12.1-alpine AS runner

RUN apk add curl
WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

COPY entrypoint.sh entrypoint.sh
COPY dist dist
RUN mv dist/package.json package.json
RUN yarn --ignore-scripts --no-lockfile

EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
