import DownloadVideo from '@repo/helpers/download-video';
import DuplicateVideoTimeLength from '@repo/helpers/duplicate-video-time-length';
import DeleteMediaFile from '@repo/helpers/delete-media-file';
import VideoUpscaleFPS from '@repo/helpers/video-upscale-fps';
import CopyFile from '@repo/helpers/copy-file';
import AddAudioToVideoInTime from '@repo/helpers/add-audio-to-video-in-time';
import ExtractAudioFromVideo from '@repo/helpers/extract-audio-from-video';
import DuplicateAudioTimeLength from '@repo/helpers/duplicate-audio-time-length';

type Props = {
  url: string;
  dest: string;
  timeLength: number;
  duration?: number;
  upscaleFPS?: number;
  outputFolder?: string;
};

type GetFinalAudioProps = {
  src: string;
  dest: string;
  timeLength: number;
};
const GetFinalAudio = ({
  src,
  dest,
  timeLength = 10,
}: GetFinalAudioProps): Promise<string> => {
  return new Promise((res, rej) => {
    const dest_clean = dest.replaceAll('media/', '');
    const audio = `tmp.${dest_clean}`;
    ExtractAudioFromVideo({
      src,
      dest: audio,
    })
      .then(() => {
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
  });
};

const DownloadVideoAndLoop = ({
  url,
  dest,
  timeLength = 10,
  duration = 3,
  upscaleFPS,
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const dest_clean = dest.replaceAll('media/', '');
    const name = `tmp.${dest_clean}`;
    const audio = `tmp.${dest_clean.replaceAll('mp4', 'wav')}`;
    const videoNoAudio = `no-audio.${dest_clean}`;
    const video = dest_clean;
    DownloadVideo({
      url,
      name,
    })
      .then(() => {
        DuplicateVideoTimeLength({
          src: name,
          dest: videoNoAudio,
          timeLength,
          duration,
        })
          .then(() => {
            GetFinalAudio({
              src: name,
              dest: audio,
              timeLength,
            })
              .then(() => {
                DeleteMediaFile(`media/${name}`);
                AddAudioToVideoInTime({
                  src_video: videoNoAudio,
                  src_audio: audio,
                  dest: video,
                  offset: 0,
                })
                  .then(() => {
                    DeleteMediaFile(`media/${videoNoAudio}`);
                    DeleteMediaFile(`media/${audio}`);
                    if (upscaleFPS) {
                      const upscaleFPSTmpFile = `upscaleFPS.${dest}`;
                      CopyFile({
                        src: video,
                        dest: upscaleFPSTmpFile,
                      })
                        .then(() => {
                          VideoUpscaleFPS({
                            src: upscaleFPSTmpFile,
                            dest: video,
                            fps: upscaleFPS,
                          })
                            .then(() => {
                              DeleteMediaFile(`media/${upscaleFPSTmpFile}`);
                              res(`media/${video}`);
                            })
                            .catch((e) => rej(e));
                        })
                        .catch((e) => rej(e));
                    } else {
                      res(`media/${video}`);
                    }
                  })
                  .catch((e) => rej(e));
              })
              .catch((e) => rej(e));

            // DownloadAudioAndLoop({
            //   url,
            //   dest: audio,
            //   timeLength,
            // })
            //   .then(() => {
            //     DeleteMediaFile(`media/${name}`);
            //     AddAudioToVideoInTime({
            //       src_video: videoNoAudio,
            //       src_audio: audio,
            //       dest: video,
            //       offset: 0,
            //     })
            //       .then(() => {
            //         DeleteMediaFile(`media/${videoNoAudio}`);
            //         DeleteMediaFile(`media/${audio}`);
            //         if (upscaleFPS) {
            //           const upscaleFPSTmpFile = `upscaleFPS.${dest}`;
            //           CopyFile({
            //             src: video,
            //             dest: upscaleFPSTmpFile,
            //           })
            //             .then(() => {
            //               VideoUpscaleFPS({
            //                 src: upscaleFPSTmpFile,
            //                 dest: video,
            //                 fps: upscaleFPS,
            //               })
            //                 .then(() => {
            //                   DeleteMediaFile(`media/${upscaleFPSTmpFile}`);
            //                   res(`media/${video}`);
            //                 })
            //                 .catch((e) => rej(e));
            //             })
            //             .catch((e) => rej(e));
            //         } else {
            //           res(`media/${video}`);
            //         }
            //       })
            //       .catch((e) => rej(e));
            //   })
            //   .catch((e) => rej(e));
          })
          .catch((e) => rej(e));
      })
      .catch((e) => rej(e));
  });
};

export default DownloadVideoAndLoop;
