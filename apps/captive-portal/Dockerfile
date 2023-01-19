FROM node:18.12.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

RUN yarn set version berry

COPY dist dist
RUN mv dist/package.json package.json
RUN yarn --ignore-scripts

EXPOSE 80

ENTRYPOINT [ "yarn", "remix-serve", "dist" ]
