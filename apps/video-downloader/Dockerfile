FROM christopherguzman/nextjs-base-docker-image:latest

WORKDIR /app
ENV NODE_ENV=production

# RUN mkdir -p /root
# COPY .tidal-dl.json /root/.tidal-dl.json
# COPY .tidal-dl.token.json /root/.tidal-dl.token.json

COPY package.json .
COPY .next .next
COPY .env .
COPY package.json .
COPY public public
# https://ffbinaries.com/downloads
COPY ffmpeg .
COPY yt-dlp .
RUN chmod +x yt-dlp
RUN chmod +x ffmpeg
RUN mv ffmpeg /usr/bin
COPY netscape-cookies.txt .

RUN mkdir /usr/share/fonts
RUN mkdir /usr/share/fonts/open-sans/
COPY open-sans /usr/share/fonts/open-sans/

CMD [ "npm", "run", "start" ]
