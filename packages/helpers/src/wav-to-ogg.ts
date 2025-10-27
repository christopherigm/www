import { exec } from 'child_process';
import fs from 'fs';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  outputFolder?: string;
};

const WavToOgg = ({
  src,
  dest,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_file = `${outputFolder}/${src}`;
  const dest_file = `${outputFolder}/${dest}`;

  return new Promise((res, rej) => {
    // ffmpeg -i input.wav -c:a libvorbis -qscale:a 5 output.ogg
    let command = `ffmpeg -y -i ${src_file} `;
    command += '-c:a libvorbis -qscale:a 10 -ac 2 ';
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest}`);
    });
  });
};

export default WavToOgg;
