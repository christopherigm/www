import DownloadVideo from '@repo/helpers/download-video';
import DuplicateAudioTimeLength from '@repo/helpers/duplicate-audio-time-length';
import DeleteMediaFile from '@repo/helpers/delete-media-file';
import ExtractAudioFromVideo from '@repo/helpers/extract-audio-from-video';

type Props = {
  url: string;
  dest: string;
  timeLength: number;
  outputFolder?: string;
  upscaleFPS?: number;
};

const DownloadAudioAndLoop = ({
  url,
  dest,
  timeLength = 10,
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const dest_clean = dest.replaceAll('media/', '');
    const video = `tmp.video.${dest_clean}`;
    const audio = `tmp.${dest_clean}`;
    DownloadVideo({
      url,
      name: video,
    })
      .then(() => {
        ExtractAudioFromVideo({
          src: video,
          dest: audio,
        })
          .then(() => {
            DeleteMediaFile(`media/${video}`);
            DuplicateAudioTimeLength({
              src: audio,
              dest: dest,
              timeLength,
            })
              .then((v) => {
                DeleteMediaFile(`media/${audio}`);
                res(v);
              })
              .catch((e) => rej(e));
          })
          .catch((e) => rej(e));
      })
      .catch((e) => rej(e));
  });
};

export default DownloadAudioAndLoop;
