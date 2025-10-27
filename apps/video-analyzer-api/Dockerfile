FROM christopherguzman/django-base-docker-image:latest

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY . .

RUN rm -f /etc/localtime \
    && ln -sv /usr/share/zoneinfo/America/Denver /etc/localtime \
    && echo "America/Denver" > /etc/timezone

CMD [ "/bin/sh", "docker-entrypoint.sh" ]
