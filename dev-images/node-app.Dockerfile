FROM node:16.4.0-alpine
ENV NODE_ENV development
ENV DEBUG "@ha/*"
RUN apk add bash
WORKDIR /app
CMD [ "yarn" ]
USER root