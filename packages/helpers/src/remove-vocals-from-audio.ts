import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  format?: 'wav' | 'mp3' | 'ogg';
  outputFolder?: string;
};

const RemoveVocalsFromAudio = ({
  src,
  dest,
  format = 'wav',
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_clean = src.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  const src_file = `${outputFolder}/${src_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    let command = `ffmpeg -y -i ${src_file} `;
    if (format === 'wav') {
      command += '-af pan="stereo|c0=c0|c1=-1*c1" -ac 1 ';
    }
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default RemoveVocalsFromAudio;
