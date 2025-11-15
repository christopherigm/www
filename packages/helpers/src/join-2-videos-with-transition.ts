import { exec } from 'child_process';
import GetWavLength from '@repo/helpers/get-wav-length';
// https://ottverse.com/crossfade-between-videos-ffmpeg-xfade-filter/

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Transitions =
  | 'dissolve'
  | 'radial'
  | 'circleopen'
  | 'circleclose'
  | 'pixelize'
  | 'hlslice'
  | 'hrslice'
  | 'vuslice'
  | 'vdslice'
  | 'hblur'
  | 'fadegrays'
  | 'fadeblack'
  | 'fadewhite'
  | 'rectcrop'
  | 'circlecrop'
  | 'wipeleft'
  | 'wiperight'
  | 'slidedown'
  | 'slideup'
  | 'slideleft'
  | 'slideright'
  | 'distance'
  | 'diagtl';

type Props = {
  src_1: string;
  src_2: string;
  dest: string;
  duration?: number;
  offset?: number;
  transition?: Transitions;
  outputFolder?: string;
};

const Join2VideosWithTransition = ({
  src_1,
  src_2,
  dest,
  duration = 3,
  transition = 'dissolve',
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_1_clean = src_1.replaceAll('media/', '');
    const src_2_clean = src_2.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');

    const src_1_file = `${outputFolder}/${src_1_clean}`;
    const src_2_file = `${outputFolder}/${src_2_clean}`;
    const dest_file = `${outputFolder}/${dest_clean}`;

    GetWavLength({
      src: src_1_clean,
    }).then((videoLength: number) => {
      const offset = videoLength - duration;
      /*
        ffmpeg -y -i 1.mp4 -i 2.mp4 \
        -filter_complex xfade=transition=dissolve:duration=3:offset=10 \
        output.mp4
      */
      let command = 'ffmpeg -y ';
      command += `-i ${src_1_file} `;
      command += `-i ${src_2_file} `;
      command += '-filter_complex ';
      command += `xfade=transition=${transition}:`;
      command += `duration=${duration}:`;
      command += `offset=${offset} `;
      command += dest_file;
      exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
        if (error) {
          console.log('CMD:', command, nodeEnv == 'production' ? '' : error);
          return rej(error);
        }
        return res(`media/${dest_clean}`);
      });
    });
  });
};

export default Join2VideosWithTransition;
