import { exec } from 'child_process';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  ss?: number;
  to?: number;
  justAudio?: boolean;
  outputFolder?: string;
};

const CutVideoLength = ({
  src,
  dest,
  ss = 0,
  to = 5,
  justAudio = false,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_clean = src.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');

    const src_file = `${outputFolder}/${src_clean}`;
    const dest_file = `${outputFolder}/${dest_clean}`;

    let command = `ffmpeg -y -i "${src_file}" `;
    command += `-ss ${ss} `;
    command += `-to ${to} `;
    // command += '-c copy ';
    if (justAudio) {
      command += '-c:a copy ';
    } else {
      command += '-c:v libx264 -c:a copy ';
    }
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('CMD:', command);
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default CutVideoLength;
