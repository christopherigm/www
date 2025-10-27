import { exec } from 'child_process';
import RandomNumber from '@repo/helpers/random-number';
const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  url: string;
  name: string;
  outputFolder?: string;
  cookies?: string;
};

const DownloadImage = ({
  url,
  name,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
  cookies = nodeEnv == 'production'
    ? '/app/netscape-cookies.txt'
    : './netscape-cookies.txt',
}: Props): Promise<string> => {
  const src_clean = name.replaceAll('media/', '');

  const clean_name = src_clean ?? RandomNumber(1, 19999).toString();
  const file = `${outputFolder}/${clean_name}.jpg`;

  return new Promise((res, rej) => {
    const command = `wget --load-cookies ${cookies} "${url}" -O "${file}"`;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('exec error image:', error);
        return rej(error);
      }
      return res(`media/${clean_name}.jpg`);
    });
  });
};

export default DownloadImage;
