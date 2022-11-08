FROM node:16.15.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

COPY entrypoint.sh entrypoint.sh
COPY dist dist
RUN yarn global add @remix-run/serve@1.7.2

EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]
