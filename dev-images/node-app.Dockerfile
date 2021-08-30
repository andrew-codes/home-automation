FROM node:16.4.0-alpine
ENV NODE_ENV development
ENV DEBUG "@ha/*"
WORKDIR /app
CMD [ "yarn" ]
USER root