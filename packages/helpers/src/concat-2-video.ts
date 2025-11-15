import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src_1: string;
  src_2: string;
  dest: string;
  outputFolder?: string;
};

const Concat2Videos = ({
  src_1,
  src_2,
  dest,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_1_clean = src_1.replaceAll('media/', '');
    const src_2_clean = src_2.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');

    const src_1_file = `${outputFolder}/${src_1_clean}`;
    const src_2_file = `${outputFolder}/${src_2_clean}`;
    const dest_file = `${outputFolder}/${dest_clean}`;

    let command = 'ffmpeg -y ';
    command += `-i ${src_1_file} `;
    command += `-i ${src_2_file} `;
    command += '-filter_complex "[0:v][0:a][1:v][1:a]';
    command += 'concat=n=2:v=1:a=1[outv][outa]" ';
    command += '-map "[outv]" -map "[outa]" ';
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('Concat2Videos CMD:', command, error);
        return rej(error);
      }
      return res(`media/${dest}`);
    });
  });
};

export default Concat2Videos;
