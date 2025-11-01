helm delete nginx-web -n video-analyzer && \
helm install nginx-web deployment/nginx -n video-analyzer \
 --set apiName=video-analyzer

./yt-dlp --skip-download --write-auto-sub --sub-lang en --convert-subs=none https://youtu.be/CE_0jr62YqY -o data

./yt-dlp --skip-download --write-auto-sub --sub-lang en --convert-subs=srt https://youtu.be/CE_0jr62YqY -o data

ollama run gemma3:latest "Genera un resumen del siguiente texto y dime la tendencia politica (izquiera o derecha) del video en porcentaje asi como el tono del mismo: " < /home/christopher/Documents/www/apps/video-analyzer/data.en.vtt

./yt-dlp --skip-download --write-auto-sub --sub-lang "es.\*" --convert-subs=none https://youtu.be/CE_0jr62YqY -o data

./yt-dlp --skip-download --write-auto-sub --convert-subs=none https://youtu.be/CE_0jr62YqY -o data

yt-dlp -vU --skip-download --list-subs https://youtu.be/Ir5cbSbjNWA

### Video Formats

yt-dlp --list-formats https://youtu.be/Ir5cbSbjNWA

### VIdeo Language

yt-dlp --dump-json https://youtu.be/oBpBWTb3k2g | jq --raw-output ".language"

yt-dlp -vU --skip-download --write-automatic-subs --write-subs --sub-lang "es" https://youtu.be/oBpBWTb3k2g -o data

https://youtu.be/UHPLB8y4Fg4?si=xJs7ymG--hG-RdqJ

### Tiktok

yt-dlp --dump-json https://www.instagram.com/reel/DOGgdT1EptN/ | jq --raw-output ".language"

yt-dlp --list-formats https://www.instagram.com/reel/DOGgdT1EptN/

yt-dlp --skip-download --write-automatic-subs --write-subs --sub-lang "all" https://www.instagram.com/reel/DOGgdT1EptN/ -o data

yt-dlp --skip-download --write-automatic-subs --write-subs --sub-langs "es-US" --convert-subs=srt https://youtu.be/YXOphjdTFxM

curl -Ls -o /dev/null -w %{url_effective} https://vt.tiktok.com/ZSAqtLU6N/

./yt-dlp "https://www.tiktok.com/@nerdnode0/video/7544467250921655574?is_from_webapp=1&sender_device=pc" --add-header "user-agent:Mozilla/5.0" -vU -S "codec:h264" --cookies ./netscape-cookies.txt --merge-output-format mp4 -o "63a5b4bb-8671-478b-943f-deaf11ec5cee.mp4" --quiet

### Facebook

yt-dlp --dump-json https://www.facebook.com/share/r/1QvX77aqcb/ | jq --raw-output ".language"

yt-dlp --skip-download --write-automatic-subs --write-subs https://vt.tiktok.com/ZSAqtLU6N/

https://youtu.be/oBpBWTb3k2g

## Korean

yt-dlp --dump-json https://youtu.be/oBpBWTb3k2g | jq --raw-output > ./test/data.json

yt-dlp --dump-json https://youtu.be/oBpBWTb3k2g | jq --raw-output ".language"

## Spanish

yt-dlp --dump-json https://www.youtube.com/watch?v=oBpBWTb3k2g | jq --raw-output > ./test/data.json

yt-dlp --dump-json https://youtu.be/5TeBEl4W2Xc | jq --raw-output ".language"

## Spanish 2

yt-dlp --dump-json https://youtu.be/TGovoTx4vGY | jq --raw-output > ./test/data.json

yt-dlp --dump-json https://youtu.be/TGovoTx4vGY | jq --raw-output ".language"

./yt-dlp --dump-json "https://www.tiktok.com/@oddanny/video/7541175292136574239?is_from_webapp=1&sender_device=pc" | jq --raw-output > data.json

## Extract audio from Video with FFMpeg

ffmpeg -i video.mp4 file.mp3

## Karaoke with FFMpeg

ffmpeg -i file.mp3 -af pan="stereo|c0=c0|c1=-1\*c1" -ac 1 karaoke.mp3

## All together

ffmpeg -y -i video.mp4 file.mp3 && \
ffmpeg -y -i file.mp3 -af pan="stereo|c0=c0|c1=-1\*c1" -ac 1 karaoke.mp3 && \
rm file.mp3

# Extract just audio

./yt-dlp "https://www.tiktok.com/@thesanchezlab/video/7536306451518819607?is_from_webapp=1&sender_device=pc" \
 --cookies ./netscape-cookies.txt \
 -f "bestaudio" \
 --add-header "user-agent:Mozilla/5.0" \
 --no-playlist -o "song.%(ext)s"

./yt-dlp "https://www.tiktok.com/@thesanchezlab/video/7536306451518819607?is_from_webapp=1&sender_device=pc" \
--list-formats

--add-header "user-agent:Mozilla/5.0" -vU -S "codec:h264" --cookies ./netscape-cookies.txt --merge-output-format mp4 -o "63a5b4bb-8671-478b-943f-deaf11ec5cee.mp4" --quiet

## Test Links

FB No SRT
https://www.facebook.com/share/r/1A9Btz16bx/

FB SRT
https://www.facebook.com/share/r/1JX5HvoEMm/

Tiktok
https://www.tiktok.com/@thesanchezlab/video/7547435109322968342?_t=ZS-90FVDF5C5Xl

https://www.tiktok.com/@soulnscripts/video/7551423372958125334?_t=ZS-906nQ5z01en

YouTube
https://youtu.be/i0oxffK8zLc
