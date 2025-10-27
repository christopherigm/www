FROM christopherguzman/nextjs-base-docker-image:latest

WORKDIR /app
ENV NODE_ENV=production

COPY package.json .
COPY .next .next
COPY .env .
COPY package.json .
COPY public public

CMD [ "npm", "run", "start" ]
