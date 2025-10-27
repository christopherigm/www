import { exec } from 'child_process';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  files: Array<string>;
  dest: string;
  outputFolder?: string;
};

const ConcatWavFiles = ({
  files,
  dest,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const dest_file = `${outputFolder}/${dest}`;

  return new Promise((res, rej) => {
    // ffmpeg -i input.wav -c:a libvorbis -qscale:a 5 output.ogg
    // ffmpeg -f lavfi -t 2 -i anullsrc=channel_layout=stereo:sample_rate=44100 -i my_audio.wav -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" output_with_silence.wav
    let command = 'ffmpeg -y ';
    let filter_complex = '-filter_complex "';
    files.map((src, index: number) => {
      const src_file = `${outputFolder}/${src}`;
      command += `-i ${src_file} `;
      filter_complex += `[${index}:a]`;
    });
    filter_complex += `concat=n=${files.length}:v=0:a=1[out]" `;
    command += `${filter_complex} -map "[out]" `;
    command += dest_file;
    console.log('CMD:', command);
    // res(`media/${dest}`);
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest}`);
    });
  });
};

export default ConcatWavFiles;
