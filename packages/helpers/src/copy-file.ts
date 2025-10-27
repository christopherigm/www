import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  outputFolder?: string;
};

const CopyFile = ({
  src,
  dest,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_clean = src.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  const src_file = `${outputFolder}/${src_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    const command = `cp -r "${src_file}" "${dest_file}"`;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default CopyFile;
