import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  outputFolder?: string;
};

const GetWavLength = ({
  src,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<number> => {
  const src_clean = src.replaceAll('media/', '');

  const src_file = `${outputFolder}/${src_clean}`;

  return new Promise((res, rej) => {
    // ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.wav
    let command = 'ffprobe -v error -show_entries format=duration ';
    command += '-of default=noprint_wrappers=1:nokey=1 ';
    command += src_file;
    // console.log('CMD:', command);
    exec(command, { maxBuffer: 1024 * 2048 }, (error, data) => {
      if (error) {
        return rej(error);
      }
      return res(Number(data));
    });
  });
};

export default GetWavLength;
