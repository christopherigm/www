import DuplicateVideoXTimes from '@repo/helpers/duplicate-video-x-times';
import GetWavLength from '@repo/helpers/get-wav-length';
import CutVideoLength from '@repo/helpers/cut-video-length';
import DeleteMediaFile from '@repo/helpers/delete-media-file';

type Props = {
  src: string;
  dest: string;
  timeLength: number;
  duration?: number;
  outputFolder?: string;
};

const DuplicateVideoTimeLength = ({
  src,
  dest,
  timeLength = 10,
  duration = 3,
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_clean = src.replaceAll('media/', '');
    const raw_dest_clean = 'raw_' + dest.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');
    GetWavLength({
      src: src_clean,
    })
      .then((value) => {
        const unit = value - duration;
        let time = unit;
        let times = 1;
        while (time < timeLength) {
          time = time + unit;
          times++;
        }
        DuplicateVideoXTimes({
          src: src_clean,
          dest: raw_dest_clean,
          times,
          duration,
        })
          .then(() => {
            CutVideoLength({
              src: raw_dest_clean,
              dest: dest_clean,
              to: timeLength,
            })
              .then((v) => {
                DeleteMediaFile(`media/${raw_dest_clean}`);
                res(v);
              })
              .catch((error) => rej(error));
          })
          .catch((error) => rej(error));
      })
      .catch((e) => rej(e));
  });
};

export default DuplicateVideoTimeLength;
