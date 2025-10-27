Build docker image

```sh
cp ../../package.json . && \
docker build -t nextjs-base-docker-image . && \
docker tag nextjs-base-docker-image christopherguzman/nextjs-base-docker-image:latest && \
docker push christopherguzman/nextjs-base-docker-image:latest
```
