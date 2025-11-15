import DuplicateAudiosXTimes from '@repo/helpers/duplicate-audio-x-times';
import GetWavLength from '@repo/helpers/get-wav-length';
import CutVideoLength from '@repo/helpers/cut-video-length';
import DeleteMediaFile from '@repo/helpers/delete-media-file';

type Props = {
  src: string;
  dest: string;
  timeLength: number;
  outputFolder?: string;
};

const DuplicateAudioTimeLength = ({
  src,
  dest,
  timeLength = 10,
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const src_clean = src.replaceAll('media/', '');
    const raw_dest_clean = 'raw_' + dest.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');
    GetWavLength({
      src: src_clean,
    })
      .then((value) => {
        const unit = value - 5;
        let time = unit;
        let times = 1;
        while (time < timeLength) {
          time = time + unit;
          times++;
        }
        DuplicateAudiosXTimes({
          src: src_clean,
          dest: raw_dest_clean,
          times,
        })
          .then(() => {
            CutVideoLength({
              src: raw_dest_clean,
              dest: dest_clean,
              to: timeLength,
              justAudio: true,
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

export default DuplicateAudioTimeLength;
