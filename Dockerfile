FROM node:lts-alpine

RUN apk add --no-cache bash

ENV NODE_ENV=production

WORKDIR /app

COPY . /app

RUN npm ci

EXPOSE 3000

CMD [ "bash", "-c", "node app.js" ]