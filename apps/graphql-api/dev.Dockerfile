FROM node:15.3.0
ENV NODE_ENV development
ENV DEBUG "@ha/*"
WORKDIR /app
CMD [ "yarn" ]