FROM node:16.14.2-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

COPY ./ ./

RUN yarn install

CMD ["yarn", "start"]