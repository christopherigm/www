import fs from 'fs';
import Join2VideosWithTransition from '@repo/helpers/join-2-videos-with-transition';
import CopyFile from '@repo/helpers/copy-file';
import RandomNumber from '@repo/helpers/random-number';
import Concat2Videos from '@repo/helpers/concat-2-video';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  times?: number;
  outputFolder?: string;
  duration?: number;
};

type Void = (v: string) => void;

const ProcessVideo = (
  videos: Array<string>,
  tmpFolder: string,
  duration: number,
  done: Void,
  error: Void
) => {
  if (videos.length < 2) {
    return error('no videos');
  }
  const src_2 = videos.pop() ?? '';
  const src_1 = videos.pop() ?? '';
  const dest = `${tmpFolder}/${videos.length}.tmp.mp4`;
  if (src_1 && src_2) {
    if (duration) {
      Join2VideosWithTransition({
        src_1,
        src_2,
        duration,
        dest,
      })
        .then(() => {
          videos.push(dest);
          if (videos.length === 1) {
            return done(dest);
          }
          return ProcessVideo(videos, tmpFolder, duration, done, error);
        })
        .catch((e) => error(e));
    } else {
      Concat2Videos({
        src_1,
        src_2,
        dest,
      })
        .then(() => {
          videos.push(dest);
          if (videos.length === 1) {
            return done(dest);
          }
          return ProcessVideo(videos, tmpFolder, duration, done, error);
        })
        .catch((e) => error(e));
    }
  }
};

const DuplicateVideoXTimes = ({
  src,
  dest,
  times = 0,
  duration = 3,
}: Props): Promise<string> => {
  const src_clean = src.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  return new Promise((res, rej) => {
    const videos: Array<string> = [];
    const createNewFiles: Array<Promise<void>> = [];

    const outputFolder =
      nodeEnv == 'production' ? '/app/media' : 'public/media';
    const tmpFolder = RandomNumber(4000, 999999).toString();
    fs.mkdirSync(`${outputFolder}/${tmpFolder}`, { recursive: true });

    for (let i = 0; i < times; i++) {
      const fileName = `${tmpFolder}/${i}-${src_clean}`;
      videos.push(fileName);
      createNewFiles.push(
        new Promise((res, rej) => {
          CopyFile({
            src: src_clean,
            dest: fileName,
          })
            .then(() => res())
            .catch((e) => rej(e));
        })
      );
    }
    Promise.all(createNewFiles)
      .then(() => {
        ProcessVideo(
          videos,
          tmpFolder,
          duration,
          (final) =>
            CopyFile({
              src: final,
              dest: dest_clean,
            })
              .then(() => {
                fs.rmdirSync(`${outputFolder}/${tmpFolder}`, {
                  recursive: true,
                });
                res(`media/${dest_clean}`);
              })
              .catch((e) => rej(e)),
          () => rej('Error DuplicateVideoXTimes ProcessVideos')
        );
      })
      .catch(() => rej('Error DuplicateVideoXTimes CopyFile'));
  });
};

export default DuplicateVideoXTimes;
