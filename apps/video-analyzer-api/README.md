# API

## Linux instructions

```sh
sudo apt install -y python3.12-venv libpq-dev libffi-dev libjpeg-dev
```

### Create virtualenv

```sh
python -m venv venv
```

This command will create a folder `venv` with the virtualenv inside of it.

To activate the virtualenv just do

```sh
source venv/bin/activate
```

To deactivate:

```sh
deactivate
```

### Add APP

```sh
python3 manage.py startapp my-app
```

### Production deployment

0. Patch Microk8s Nginx Ingress controller
   to set `proxy-body-size: 60m`
   https://github.com/canonical/microk8s/issues/1539

```sh
kubectl -n ingress patch configmap nginx-load-balancer-microk8s-conf --patch "$(cat ./deployment/nginx/nginx-config-map-patch.yaml)"
```

1. Build and publish Docker image

```sh
docker build -t video-analyzer-api:latest . && \
docker tag video-analyzer-api:latest christopherguzman/video-analyzer-api:latest && \
docker push christopherguzman/video-analyzer-api:latest
```

2. Create namespace

```sh
kubectl create namespace video-analyzer
```

3. Deploy Postgres

```sh
helm delete postgres -n video-analyzer && \
helm install postgres deployment/postgres \
  --namespace=video-analyzer \
  --set config.POSTGRES_DB=video \
  --set config.POSTGRES_USER=video \
  --set config.POSTGRES_PASSWORD=video
```

4. Deploy Nginx server

```sh
helm uninstall -n video-analyzer nginx-api && \
helm install nginx-api deployment/nginx \
  -n video-analyzer\
  --set apiName=video-analyzer-api \
  --set volumeMountPath=shared-volume
```

Delete:

```
helm uninstall nginx-api deployment/nginx -n video-analyzer
```

5. Deploy microservice

```sh
helm install video-analyzer-api deployment \
  --namespace=video-analyzer \
  --set config.SECRET_KEY=123456 \
  --set config.ENVIRONMENT=production \
  --set config.BRANCH=main \
  --set config.DB_HOST=postgres.video-analyzer.svc.cluster.local \
  --set config.DB_NAME=video \
  --set config.DB_USER=video \
  --set config.DB_PASSWORD=video \
  --set config.EMAIL_HOST_USER=email@gmail.com \
  --set config.EMAIL_HOST_PASSWORD=password \
  --set config.API_URL="https://api.video.iguzman.com.mx" \
  --set config.WEB_APP_URL="https://video.iguzman.com.mx" \
  --set ingress.enabled=true \
  --set ingress.host=api.video.iguzman.com.mx
```

6. Delete deployments

```sh
helm delete nginx-api -n video-analyzer && \
helm delete postgres-api -n video-analyzer && \
helm delete video-analyzer-api -n video-analyzer
```

7. Automated NodeJS deployment

Regular deployment

```sh
npm run deploy
```

Regular deployment + fixtures

```sh
export RUN_FIXTURES=true && \
npm run deploy
```

## Update Python packages

```sh
python3 -m pip install \
asgiref bcrypt certifi cffi charset-normalizer \
coreapi coreschema Django django-3-jet \
django-colorfield django-cors-headers \
django-environ django-filter django-resized \
djangorestframework djangorestframework-jsonapi \
djangorestframework-simplejwt drf-yasg environ \
gunicorn idna inflection itypes Jinja2 jsmin \
MarkupSafe packaging Pillow psycopg2 pycparser \
pyenchant PyJWT pyparsing pytz requests \
ruamel.yaml ruamel.yaml.clib six sqlparse \
uritemplate urllib3 python-environ drf_extra_fields
```

Update requirements text file

```sh
npm run freeze
```
