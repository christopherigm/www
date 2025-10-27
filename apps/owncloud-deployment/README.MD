## Owncloud server

Create namespace

```sh
kubectl create namespace owncloud
```

2. Deploy MySQL

```sh
helm install mariadb deployment/maria-db -n owncloud
```

Remove MySQL Deployment

```sh
helm uninstall mariadb -n owncloud
```

3. Deploy Redis

```sh
helm install redis deployment/redis -n owncloud
```

Delete:

```sh
helm uninstall redis -n owncloud
```

```sh
helm install owncloud-server deployment -n owncloud \
  --set config.OWNCLOUD_ADMIN_USERNAME=user \
  --set config.OWNCLOUD_ADMIN_PASSWORD=12345
```

Delete deployment

```sh
helm delete owncloud-server -n owncloud
```

Reinstall everything

```sh
helm uninstall mariadb -n owncloud && \
helm uninstall redis -n owncloud && \
helm uninstall owncloud-server -n owncloud && \
helm install redis deployment/redis -n owncloud && \
helm install mariadb deployment/maria-db -n owncloud && \
helm install owncloud-server deployment -n owncloud \
 --set config.OWNCLOUD_ADMIN_USERNAME=chris \
 --set config.OWNCLOUD_ADMIN_PASSWORD=password
```

Reinstall after reboot

```sh
helm uninstall owncloud-server -n owncloud &&
helm install owncloud-server deployment -n owncloud \
 --set config.OWNCLOUD_ADMIN_USERNAME=christopher1 \
 --set config.OWNCLOUD_ADMIN_PASSWORD=password
```
