import fs from 'fs';
import Join2AudiosWithTransition from '@repo/helpers/join-2-audios-with-transition';
import CopyFile from '@repo/helpers/copy-file';
import RandomNumber from '@repo/helpers/random-number';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src: string;
  dest: string;
  times?: number;
  outputFolder?: string;
};

type Void = (v: string) => void;

const ProcessAudio = (
  audios: Array<string>,
  tmpFolder: string,
  done: Void,
  error: Void
) => {
  if (audios.length < 2) {
    return error('no audios');
  }
  const src_2 = audios.pop() ?? '';
  const src_1 = audios.pop() ?? '';
  const dest = `${tmpFolder}/${audios.length}.tmp.wav`;
  if (src_1 && src_2) {
    Join2AudiosWithTransition({
      src_1,
      src_2,
      dest,
    })
      .then(() => {
        audios.push(dest);
        if (audios.length === 1) {
          return done(dest);
        }
        return ProcessAudio(audios, tmpFolder, done, error);
      })
      .catch((e) => error(e));
  }
};

const DuplicateAudiosXTimes = ({
  src,
  dest,
  times = 0,
}: Props): Promise<string> => {
  const src_clean = src.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  return new Promise((res, rej) => {
    const audios: Array<string> = [];
    const createNewFiles: Array<Promise<void>> = [];

    const outputFolder =
      nodeEnv == 'production' ? '/app/media' : 'public/media';
    const tmpFolder = RandomNumber(4000, 999999).toString();
    fs.mkdirSync(`${outputFolder}/${tmpFolder}`, { recursive: true });

    for (let i = 0; i < times; i++) {
      const fileName = `${tmpFolder}/${i}-${src_clean}`;
      audios.push(fileName);
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
        ProcessAudio(
          audios,
          tmpFolder,
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
          () => rej('Error DuplicateAudiosXTimes ProcessAudio')
        );
      })
      .catch(() => rej('Error DuplicateAudiosXTimes CopyFile'));
  });
};

export default DuplicateAudiosXTimes;
