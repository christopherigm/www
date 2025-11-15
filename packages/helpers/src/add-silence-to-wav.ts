import { exec } from 'child_process';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  time: number;
  beginning?: boolean;
  outputFolder?: string;
};

const AddSilenceToWav = ({
  src,
  dest,
  time,
  beginning = true,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_clean = src.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  const src_file = `${outputFolder}/${src_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    let command = 'ffmpeg -y ';
    if (beginning) {
      command += `-f lavfi -t ${time} `;
      command += '-i anullsrc=channel_layout=stereo:sample_rate=44100 ';
      command += `-i ${src_file} `;
    } else {
      command += `-i ${src_file} `;
      command += `-f lavfi -t ${time} `;
      command += '-i anullsrc=channel_layout=stereo:sample_rate=44100 ';
    }
    command += '-filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" ';
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('>> AddSilenceToWav', command, '>> error:', error);
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default AddSilenceToWav;
