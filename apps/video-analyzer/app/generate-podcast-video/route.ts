import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import GetWavLength from '@repo/helpers/get-wav-length';
import CutVideoLength from '@repo/helpers/cut-video-length';
import BurnSRTIntoVideo from '@repo/helpers/burn-srt-into-video';
import AddAudioToVideoInTime from '@repo/helpers/add-audio-to-video-in-time';
import RandomNumber from '@repo/helpers/random-number';
import DeleteMediaFile from '@repo/helpers/delete-media-file';
import AddImagesToVideo from '@repo/helpers/add-images-to-video';
import type { Diarization } from '@repo/helpers/generate-audio-diarization';
import ChangeVolumeWav from '@repo/helpers/change-volume-wav';
import MergeWavFiles from '@repo/helpers/merge-wav-files';
import AddSilenceToWav from '@repo/helpers/add-silence-to-wav';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const videoBackground = body?.videoBackground ?? '';
  const videoMusic = body?.videoMusic ?? '';
  const musicVolume = Number(body?.musicVolume ?? 8) / 100;
  if (!id) {
    return Response.json(
      {
        id: '',
        status: 'error',
        url: '',
        error: 'No prompt provided',
      },
      {
        status: 400,
      }
    );
  }

  return GetVideoByID(id)
    .then(async (video) => {
      console.log('=====================================');
      const originalFile = video.attributes.local_link_podcast_video;
      console.log('Processing podacast video #', video.id);
      video.attributes.logs += '\n\n> processing podcast video! \n\n';

      const localLinkPodcast = `${video.attributes.uuid}.podcast.audio-extended.wav`;

      await AddSilenceToWav({
        src: video.attributes.local_link_podcast,
        dest: localLinkPodcast,
        time: 5,
        beginning: false,
      });
      // console.log('>> AddSilenceToWav OK');

      const wavLength = await GetWavLength({ src: localLinkPodcast });

      // const originalVideo = `video-backgrounds/${videoBackground}.mp4`;
      const originalVideo = videoBackground;

      const videoTmp = video.attributes.uuid + '.podcast-video.tmp.mp4';
      const videoSRT = video.attributes.uuid + '.podcast-video.srt.mp4';

      const sufix = RandomNumber(1, 99999);
      const finalVideo = `${video.attributes.uuid}.podcast-video.${sufix}.mp4`;

      // const videoLength = await GetWavLength({ src: originalVideo });
      // const setptsFactor = wavLength / videoLength;

      CutVideoLength({
        src: originalVideo,
        dest: videoTmp,
        to: wavLength,
      })
        .then(async () => {
          console.log('>> CutVideoLength OK');
          let finalAudio = localLinkPodcast;
          console.log('>>> videoMusic', videoMusic);
          console.log('>>> musicVolume', musicVolume);
          if (videoMusic) {
            const music = `${video.attributes.uuid}.podcast-video.music.wav`;
            await ChangeVolumeWav({
              // src: 'media/music/piano.wav',
              src: videoMusic,
              dest: music,
              volume: musicVolume,
            });
            finalAudio = `${video.attributes.uuid}.podcast-video.audio.wav`;
            await MergeWavFiles({
              files: [localLinkPodcast, music],
              dest: finalAudio,
            });
            DeleteMediaFile(`media/${music}`);
            DeleteMediaFile(localLinkPodcast);
          }

          await BurnSRTIntoVideo({
            src_video: videoTmp,
            dest_video: videoSRT,
            srt_string: video.attributes.podcast_srt,
            marginV: 10,
          });
          // console.log('>> BurnSRTIntoVideo OK');

          await AddAudioToVideoInTime({
            src_video: videoSRT,
            src_audio: finalAudio,
            dest: finalVideo,
            offset: 0,
          });
          // console.log('>> AddAudioToVideoInTime OK');

          DeleteMediaFile(`media/${finalAudio}`);

          DeleteMediaFile(originalFile);
          DeleteMediaFile(`media/${videoTmp}`);
          DeleteMediaFile(`media/${videoSRT}`);
          video.attributes.local_link_podcast_video = `media/${finalVideo}`;

          if (!video.attributes.podcast_diarization) {
            UpdateVideoAttributes(video).catch((error) =>
              console.log('>> video.save() error:', error)
            );
          } else {
            let diarizations: Array<Diarization> = [];
            diarizations = JSON.parse(video.attributes.podcast_diarization);
            if (
              diarizations &&
              diarizations.length &&
              diarizations[0].speaker !== 0
            ) {
              diarizations = diarizations.map((i) => {
                return {
                  ...i,
                  speaker: i.speaker === 0 ? 1 : 0,
                };
              });
            }

            const width = 400;
            const gap = 0;

            const images = [];
            for (let j = 0; j < diarizations.length; j++) {
              const speaker = diarizations[j].speaker;
              const x = speaker === 0 ? `${gap}` : `main_w-overlay_w-${gap}`;
              const y = `main_h-overlay_h-${gap}`;

              images.push({
                src_image: `${speaker}.png`,
                start: diarizations[j].start,
                end: diarizations[j].end,
                x,
                y,
                width: width.toString(),
              });
            }
            const sufix = RandomNumber(1, 99999);
            const newFinalVideo = `${video.attributes.uuid}.podcast-video.${sufix}.mp4`;
            AddImagesToVideo({
              src_video: `media/${finalVideo}`,
              dest: newFinalVideo,
              images,
            })
              .then((v) => {
                console.log('>> AddImagesToVideo:', v);
                DeleteMediaFile(`media/${finalVideo}`);
                video.attributes.local_link_podcast_video = `media/${newFinalVideo}`;
                UpdateVideoAttributes(video).catch((error) =>
                  console.log('>> video.save() error:', error)
                );
              })
              .catch((e) => {
                console.log('>> AddImagesToVideo error:', e);
                video.attributes.logs += `> Error proccessing podcast video:\n${e}\n\n`;
                video.attributes.local_link_podcast_video = 'error';
                UpdateVideoAttributes(video).catch((error) =>
                  console.log('>> video.save() error:', error)
                );
              });
          }
        })
        .catch((e) => {
          video.attributes.logs += `> Error proccessing podcast video:\n${e}\n\n`;
          video.attributes.local_link_podcast_video = 'error';
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });
      video.attributes.local_link_podcast_video = 'processing';
      return UpdateVideoAttributes(video)
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
