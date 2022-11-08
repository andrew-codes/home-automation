FROM node:16.15.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

COPY entrypoint.sh entrypoint.sh
COPY dist dist
COPY package.json dist/package.json
RUN yarn global add remix-serve

EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
