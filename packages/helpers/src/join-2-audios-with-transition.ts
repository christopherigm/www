import { exec } from 'child_process';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src_1: string;
  src_2: string;
  dest: string;
  duration?: number;
  outputFolder?: string;
};

const Join2AudiosWithTransition = ({
  src_1,
  src_2,
  dest,
  duration = 5,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_1_clean = src_1.replaceAll('media/', '');
    const src_2_clean = src_2.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');

    const src_1_file = `${outputFolder}/${src_1_clean}`;
    const src_2_file = `${outputFolder}/${src_2_clean}`;
    const dest_file = `${outputFolder}/${dest_clean}`;
    /*
      ffmpeg -i audio1.mp3 -i audio2.mp3 
      -filter_complex "
      [0:a]atrim=duration=PTS-2[a0];
      [1:a]atrim=start=2[a1];[a0][a1]
      acrossfade=d=2:c1=exp:c2=exp" output.mp3


      ffmpeg -i input1.wav -i input2.wav 
      -filter_complex "
      [0:a][1:a]acrossfade=d=DURATION:c1=CURVE1:c2=CURVE2[out_a]" 
      -map "[out_a]" output.wav

      ffmpeg -i audio1.wav -i audio2.wav \
      -filter_complex \
      "[0:a]atrim=0:8[a1];[1:a]atrim=0:2[a2];[a1][a2]acrossfade=d=2:c1=lin:c2=lin" \
      output.wav
    */
    let command = 'ffmpeg -y ';
    command += `-i ${src_1_file} `;
    command += `-i ${src_2_file} `;
    command += '-filter_complex ';
    command += `"[0:a][1:a]acrossfade=d=${duration}:c1=exp:c2=log" `;
    // command += `[0:a]atrim=duration=PTS-${duration}[a0];`;
    // command += `[1:a]atrim=start=${duration}[a1];[a0][a1]`;
    // command += `acrossfade=d=${duration}:c1=exp:c2=exp" `;
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('Join2AudiosWithTransition error:', command, ' >> ', error);
        return rej(error);
      }
      return res(`media/${dest}`);
    });
  });
};

export default Join2AudiosWithTransition;
