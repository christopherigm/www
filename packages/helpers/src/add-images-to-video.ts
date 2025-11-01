import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Image = {
  src_image: string;
  start: number;
  end: number;
  x?: string;
  y?: string;
  width?: string;
};

type Props = {
  src_video: string;
  dest: string;
  images: Array<Image>;
  outputFolder?: string;
};

const AddImagesToVideo = ({
  src_video,
  dest,
  images = [],
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_video_clean = src_video.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');
  const src_video_file = `${outputFolder}/${src_video_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    /*
    ffmpeg -i input.mp4 -i image1.png -i image2.png -i image3.png \
    -filter_complex \
    "[0:v]setsar=1[base]; \
    [1:v]scale=iw*0.5:-1[img1]; \
    [2:v]scale=iw*0.75:-1[img2]; \
    [3:v]scale=iw\*0.6:-1[img3]; \
    [base][img1]overlay=x=10:y=10:enable='between(t,5,10)'[v1]; \
    [v1][img2]overlay=x=50:y=50:enable='between(t,12,17)'[v2]; \
    [v2][img3]overlay=x=90:y=90:enable='between(t,20,25)'[outv]" \
    -map "[outv]" -map 0:a? -c:a copy output.mp4
    */
    let command = `ffmpeg -y -i "${src_video_file}" `;
    for (let j = 0; j < images.length; j++) {
      const src_image_clean = images[j]?.src_image.replaceAll('media/', '');
      const src_image_file = `${outputFolder}/people/${src_image_clean}`;
      command += `-i ${src_image_file} `;
    }
    command += '-filter_complex "';
    command += '[0:v]setsar=1[base];';
    for (let j = 0; j < images.length; j++) {
      command += `[${j + 1}:v]scale=${images[j]?.width}:-1[img${j + 1}];`;
    }
    for (let j = 0; j < images.length; j++) {
      const x = images[j]?.x;
      const y = images[j]?.y;
      const start = images[j]?.start;
      const end = images[j]?.end;
      if (j === 0) {
        command += '[base]';
      } else {
        command += `[v${j}]`;
      }
      command += `[img${j + 1}]`;
      command += `overlay=x=${x}:y=${y}:`;
      command += `enable='between(t,${start},${end})'`;
      if (j === images.length - 1) {
        command += '[outv]';
      } else {
        command += `[v${j + 1}];`;
      }
    }
    command += '" -map "[outv]" -map 0:a? -c:a copy ';
    command += dest_file;

    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('AddImagesToVideo:', command, '>> error:', error);
        return rej(error);
      }
      return res(`media/${dest_file}`);
    });
  });
};

export default AddImagesToVideo;
