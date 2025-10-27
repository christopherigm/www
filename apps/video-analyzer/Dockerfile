FROM christopherguzman/nextjs-base-docker-image:latest

WORKDIR /app
ENV NODE_ENV=production

COPY package.json .
COPY .next .next
COPY .env .
COPY package.json .
COPY public public
# https://ffbinaries.com/downloads
COPY yt-dlp .
RUN chmod +x yt-dlp
RUN mv yt-dlp /usr/bin
COPY netscape-cookies.txt .

CMD [ "npm", "run", "start" ]
