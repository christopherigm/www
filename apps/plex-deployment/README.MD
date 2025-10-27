## Deploy Nginx proxy

Create namespace

```sh
kubectl create namespace plex
```

```sh
helm install plex-media-nginx-proxy deployment \
  --namespace=plex \
  --set name=plex-media \
  --set ingress.host=media.iguzman.com.mx \
  --set service.serverIP=192.168.0.12 \
  --set service.serverPort=32400

helm install plex-photos-nginx-proxy deployment -n plex \
--set name=plex-photo \
--set ingress.host=photos.media.iguzman.com.mx \
--set service.serverIP=192.168.0.11 \
--set service.serverPort=32400
```

Delete deployment

```sh
helm delete plex-media-nginx-proxy -n plex && \
helm delete plex-photos-nginx-proxy -n plex
```

Raspberry Pi Zero Proxy

```sh
helm delete raspberrypi-nginx-proxy -n raspberrypi && \
helm install raspberrypi-nginx-proxy deployment -n raspberrypi \
--set name=raspberrypi \
--set ingress.host=raspberrypi.liveness.iguzman.com.mx \
--set service.serverIP=192.168.0.26 \
--set service.serverPort=80
```
