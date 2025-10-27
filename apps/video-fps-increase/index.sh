#!/bin/bash
# https://blog.programster.org/ffmpeg-create-smooth-videos-with-frame-interpolation

directory="$1";

destination="$2"

mkdir -p $destination

for file in $directory/*.mp4; do
  filename=$(echo $file | cut -d "/" -f 5)
  # cp "$file" "$destination/$filename"
  echo ">>>> FIle: $file"
  ffmpeg -i "$file" -filter:v minterpolate -r 60 "$destination/$filename" -threads 16 -q 21 -O test.mp4
  echo "Done: $filename"
  # echo "Done: $destination/$filename"
done

# ffmpeg -i video.mp4 -filter:v minterpolate -r 60 video60fps.mp4 -threads 16 -q 21

# ffmpeg  -hwaccel cuda -i esther.MP4 \
# -filter:v minterpolate -r 120 video.mp4 -threads 16 -q 21


# ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i esther.MP4 \
# -vf "scale_cuda=1280:720" -c:v h264_nvenc output.mp4


# ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i esther.MP4 \
# -vf "minterpolate=120" -c:v h264_nvenc output.mp4

# ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i esther.MP4 \
# -filter:v minterpolate -r 120 -c:v h264_nvenc output.mp4
