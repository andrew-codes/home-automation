FROM node:16.4.0
ENV NODE_ENV development
ENV DEBUG "@ha/*"
WORKDIR /app
CMD [ "yarn" ]
USER root