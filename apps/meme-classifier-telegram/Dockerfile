FROM node:20

WORKDIR /app

COPY index.js .
COPY package.json .
RUN npm i
RUN mkdir photos

CMD ["node", "index.js"]
