import { exec } from 'child_process';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  volume: number;
  outputFolder?: string;
};

const ChangeVolumeWav = ({
  src,
  dest,
  volume = 1.0,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_clean = src.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  const src_file = `${outputFolder}/${src_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    let command = `ffmpeg -y -i ${src_file} `;
    command += `-af "volume=${volume}" `;
    command += dest_file;

    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default ChangeVolumeWav;
