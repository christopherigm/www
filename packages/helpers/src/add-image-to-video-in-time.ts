import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src_video: string;
  src_image: string;
  dest: string;
  start: number;
  end: number;
  x?: string;
  y?: string;
  width?: string;
  outputFolder?: string;
};

const AddImageToVideoInTime = ({
  src_video,
  src_image,
  dest,
  start = 0,
  end = 2,
  x = '(main_w-overlay_w)/2',
  y = 'main_h-overlay_h-0',
  width = '200',
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_video_clean = src_video.replaceAll('media/', '');
  const src_image_clean = src_image.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  const src_video_file = `${outputFolder}/${src_video_clean}`;
  const src_image_file = `${outputFolder}/${src_image_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    /*
    ffmpeg -y -i video.mp4 -i logo.png \
    -filter_complex "[0:v][1:v]overlay=(main_w-overlay_w)/2:main_h-overlay_h-0:enable='between(t,0,10)'" \
    output.mp4
    */
    let command = `ffmpeg -y -i "${src_video_file}" `;
    command += `-i "${src_image_file}" `;
    // command += `-filter_complex "[0:v][1:v]overlay=(main_w-overlay_w)/2:`;

    command += `-filter_complex "[1:v]scale=${width}:-1[scaled_img];`;
    command += `[0:v][scaled_img]`;
    command += `overlay=${x}:${y}:`;
    command += `enable='between(t,${start},${end})'" `;
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default AddImageToVideoInTime;
