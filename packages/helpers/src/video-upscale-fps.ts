import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  fps?: number;
  outputFolder?: string;
};

const VideoUpscaleFPS = ({
  src,
  dest,
  fps = 60,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_clean = src.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');

    const src_file = `${outputFolder}/${src_clean}`;
    const dest_file = `${outputFolder}/${dest_clean}`;

    let command = `ffmpeg -y -i "${src_file}" `;
    command += `-filter:v minterpolate -r ${fps} `;
    command += `"${dest_file}"`;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('Error VideoUpscaleFPS, CMD:', command, error);
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default VideoUpscaleFPS;
