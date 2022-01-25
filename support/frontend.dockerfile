FROM node:16

EXPOSE 3000
WORKDIR /frontEnd

COPY frontEnd/ /frontEnd
RUN npm install

ENTRYPOINT ["npm", "start"]