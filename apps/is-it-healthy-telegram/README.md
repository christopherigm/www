Build docker image

kubectl create namespace ai-food-classifier

```sh
npx tsc && \
docker build -t is-it-healthy-telegram . && \
docker tag is-it-healthy-telegram christopherguzman/is-it-healthy-telegram:latest && \
docker push christopherguzman/is-it-healthy-telegram:latest && \
helm uninstall is-it-healthy-telegram --namespace=ai-food-classifier && \
helm install is-it-healthy-telegram deployment \
 --namespace=ai-food-classifier \
 --set config.BOT_TOKEN=7667907943:AAHV_ugvle_DUN4qhzUkjVmCqhPoXz8fWyM && \
watch kubectl -n ai-food-classifier get pods
```

docker build -t is-it-healthy-telegram . && \
docker tag is-it-healthy-telegram christopherguzman/is-it-healthy-telegram:latest && \
docker push christopherguzman/is-it-healthy-telegram:latest &&
docker run -d -t -i -e BOT_TOKEN="8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA" \
--name is-it-healthy-telegram christopherguzman/is-it-healthy-telegram:latest

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && npx ts-node index.ts

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && npm run dev

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && npm run build

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && node index.js

Food boot - IsThisHealthyBot
7667907943:AAHV_ugvle_DUN4qhzUkjVmCqhPoXz8fWyM

export BOT_TOKEN=7667907943:AAHV_ugvle_DUN4qhzUkjVmCqhPoXz8fWyM && npm run dev
