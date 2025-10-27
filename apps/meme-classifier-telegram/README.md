Build docker image

kubectl create namespace ai-meme-classifier

```sh
npx tsc && \
docker build -t meme-classifier-telegram . && \
docker tag meme-classifier-telegram christopherguzman/meme-classifier-telegram:latest && \
docker push christopherguzman/meme-classifier-telegram:latest && \
helm uninstall meme-classifier-telegram --namespace=ai-meme-classifier && \
helm install meme-classifier-telegram deployment \
 --namespace=ai-meme-classifier \
 --set config.BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && \
watch kubectl -n ai-meme-classifier get pods
```

docker build -t meme-classifier-telegram . && \
docker tag meme-classifier-telegram christopherguzman/meme-classifier-telegram:latest && \
docker push christopherguzman/meme-classifier-telegram:latest &&
docker run -d -t -i -e BOT_TOKEN="8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA" \
--name meme-classifier-telegram christopherguzman/meme-classifier-telegram:latest

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && npx ts-node index.ts

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && npm run dev

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && npm run build

export BOT_TOKEN=8040684741:AAFOgRP5XY99Zjexa8Y0h0rorCNbUnYGbjA && node index.js

Food boot - IsThisHealthyBot
7667907943:AAHV_ugvle_DUN4qhzUkjVmCqhPoXz8fWyM

export BOT_TOKEN=7667907943:AAHV_ugvle_DUN4qhzUkjVmCqhPoXz8fWyM && npm run dev
