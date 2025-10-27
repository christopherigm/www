docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest

### Namespace

kubectl create namespace video-downloader

## Deploy Nginx server

helm install nginx-api deployment/nginx -n video-downloader \
 --set apiName=video-downloader

## Uninstall Nginx

helm delete nginx-api -n video-downloader

## Nginx Re-deploy

helm delete nginx-api -n video-downloader && \
helm install nginx-api deployment/nginx -n video-downloader \
 --set apiName=video-downloader

## Deploy Mongo

helm install mongo-api deployment/mongo -n video-downloader

## Uninstall Mongo

helm delete mongo-api -n video-downloader
