Build docker image

```sh
docker build -t django-base-docker-image . && \
docker tag django-base-docker-image christopherguzman/django-base-docker-image:latest && \
docker push christopherguzman/django-base-docker-image:latest
```
