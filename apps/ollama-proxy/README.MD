## Deploy Nginx proxy

Create namespace

```sh
kubectl create namespace ollama

helm delete ollama-web-ui -n ollama && \
helm install ollama-web-ui deployment -n ollama
```

### Docker

```sh
docker run -d -p 3000:8080 -e OLLAMA_BASE_URL=http://192.168.0.38:11434 -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### Trying to connect to the API over the network

Add the Environment info:

sudo systemctl edit ollama.service

```sh
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
```

Ask Ollama CLI

```
ollama run MODEL "summarize this text" < file.txt
```

ollama run deepseek-r1:8b "Tengo una conversacion grupal. Basado en esa informacion puedes: Analizar toda la conversacion, hacer un resumen y analizar el tono de la conversacion? Responde solo con el resumen y el tono de la conversacion. La conversacion es la siguiente: " < /home/${USER}/Downloads/chat.txt

ollama run deepseek-r1:8b "Tengo una conversacion grupal. Basado en esa informacion puedes: Analizar toda la conversacion, hacer un resumen, analizar el tono de la conversacion y hacer una lista de los principales 10 temas hablados? Responde solo con el resumen, el tono de la conversacion y lista de los principales 10 temas. La conversacion es la siguiente: " < /home/${USER}/Downloads/result.json

ollama run llama3.2:3b "Tengo una conversacion grupal. Basado en esa informacion puedes: Analizar toda la conversacion, hacer un resumen y analizar el tono de la conversacion? Responde solo con el resumen y el tono de la conversacion. La conversacion es la siguiente: " < /home/${USER}/Downloads/chat.txt

ollama run llama3.2:3b "Tengo una conversacion grupal. Basado en esa informacion puedes: Analizar toda la conversacion, hacer un resumen, analizar el tono de la conversacion y hacer una lista de los principales 10 temas hablados? Responde solo con el resumen, el tono de la conversacion, lista de los principales 10 temas, una lista de los principales actores de en la conversacion y cita el comentario con mas reactions. La conversacion es la siguiente: " < /home/${USER}/Downloads/result.json

ollama run llava:latest "Describe this image: /home/${USER}/Pictures/image.jpg"

ollama run llama3.2:3b "Genera un resumen completo para niños de 8 años, que incluya todos los capitulos, cambiando las palabras complicadas por plabras sencillas del siguiente libro: " < /home/${USER}/Downloads/book.txt

ollama run deepseek-r1:8b "Summarize in 5000 words the following text: " < /home/${USER}/Downloads/text.txt

ollama run llava:latest "You have perfect vision and pay great attention, you are very good at identifying food on images. Analyze the image and confirm that the image has real food for humans in it. Respond just with: true or false.
Does the image contain any food?: /home/${USER}/Pictures/picture.jpg"

ollama run llava:latest "You are a nutritionist. Classify this image in one of the following categories: breakfast, lunch, dinner, dessert, drink. Then extract all the ingredients to make the food, meal, candy, drink or dessert in a comma-separated list. Then generate a recipe to recreate the food, meal, candy, drink or dessert. Recipe must contain the steps. Then write a recommendation about the consumption of the food, meal, candy, drink or dessert and its possible negative health implications. Then, rate the food, meal, candy, drink or dessert in the image on a scale from 1 to 10, where 1 is not healthy and 10 is healthy. Then Name the food, meal, candy, drink or dessert according to its characteristics. Respond with: category, rate, name, recipe, ingredients, recommendation in JSON format: /home/${USER}/Pictures/picture.jpg"
