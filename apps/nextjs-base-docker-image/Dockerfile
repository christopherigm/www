FROM alpine:latest

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache python3 py3-pip nodejs npm curl jq wget ffmpeg

COPY package.json .
RUN npm i --production

RUN rm -f /etc/localtime \
    && ln -sv /usr/share/zoneinfo/America/Denver /etc/localtime \
    && echo "America/Denver" > /etc/timezone

RUN echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf

RUN mkdir /usr/share/fonts
RUN mkdir /usr/share/fonts/open-sans/
COPY open-sans /usr/share/fonts/open-sans/

RUN mkdir /usr/share/fonts/truetype/
RUN mkdir /usr/share/fonts/truetype/roboto
COPY roboto /usr/share/fonts/truetype/roboto

RUN sysctl -p
