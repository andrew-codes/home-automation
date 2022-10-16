# Production image, copy all the files and run next
FROM node:16.15.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 80

COPY entrypoint.sh entrypoint.sh
COPY dist dist
# COPY package.json package.json
# RUN yarn --ignore-scripts --no-lockfile
RUN yarn global add @remix-run/serve

EXPOSE 80

ENTRYPOINT [ "/app/entrypoint.sh" ]