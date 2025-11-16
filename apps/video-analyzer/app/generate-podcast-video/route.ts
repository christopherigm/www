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
import { VideoAttributesType } from '@/state/video-type';

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
      console.log('Processing get subtitles for video #', id);
      const attributes: VideoAttributesType = { logs: video.attributes.logs };
      attributes.logs += '\n\n> processing podcast video! \n\n';
      const originalFile = video.attributes.local_link_podcast_video;
      const localLinkPodcast = video.attributes.local_link_podcast;
      const uuid = video.attributes.uuid;
      const localLinkPodcastExtended = `${uuid}.podcast.audio-extended.wav`;
      const videoTmp = `${uuid}.podcast-video.tmp.mp4`;
      const videoSRT = `${uuid}.podcast-video.srt.mp4`;
      const sufix = RandomNumber(1, 99999);
      const finalVideo = `${uuid}.podcast-video.${sufix}.mp4`;
      const podcastDiarization = video.attributes.podcast_diarization;
      const podcastSRT = video.attributes.podcast_srt;

      await AddSilenceToWav({
        src: localLinkPodcast,
        dest: localLinkPodcastExtended,
        time: 5,
        beginning: false,
      });
      const wavLength = await GetWavLength({ src: localLinkPodcastExtended });

      CutVideoLength({
        src: videoBackground,
        dest: videoTmp,
        to: wavLength,
      })
        .then(async () => {
          let finalAudio = localLinkPodcastExtended;
          if (videoMusic) {
            const music = `${uuid}.podcast-video.music.wav`;
            await ChangeVolumeWav({
              src: videoMusic,
              dest: music,
              volume: musicVolume,
            });
            finalAudio = `${uuid}.podcast-video.audio.wav`;
            await MergeWavFiles({
              files: [localLinkPodcastExtended, music],
              dest: finalAudio,
            });
            DeleteMediaFile(`media/${music}`);
            DeleteMediaFile(localLinkPodcastExtended);
          }

          await BurnSRTIntoVideo({
            src_video: videoTmp,
            dest_video: videoSRT,
            srt_string: podcastSRT,
            marginV: 10,
          });

          await AddAudioToVideoInTime({
            src_video: videoSRT,
            src_audio: finalAudio,
            dest: finalVideo,
            offset: 0,
          });

          DeleteMediaFile(`media/${finalAudio}`);
          DeleteMediaFile(originalFile);
          DeleteMediaFile(`media/${videoTmp}`);
          DeleteMediaFile(`media/${videoSRT}`);
          attributes.local_link_podcast_video = `media/${finalVideo}`;

          if (!podcastDiarization) {
            UpdateVideoAttributes({ id, attributes }).catch((error) =>
              console.log('>> video.save() error:', error)
            );
          } else {
            let diarizations: Array<Diarization> = [];
            diarizations = JSON.parse(podcastDiarization);
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
            const newFinalVideo = `${uuid}.podcast-video.${sufix}.mp4`;
            AddImagesToVideo({
              src_video: `media/${finalVideo}`,
              dest: newFinalVideo,
              images,
            })
              .then(() => {
                DeleteMediaFile(`media/${finalVideo}`);
                attributes.local_link_podcast_video = `media/${newFinalVideo}`;
                UpdateVideoAttributes({ id, attributes }).catch((error) =>
                  console.log('>> video.save() error:', error)
                );
              })
              .catch((e) => {
                console.log('>> AddImagesToVideo error:', e);
                attributes.logs += `> Error proccessing podcast video:\n${e}\n\n`;
                attributes.local_link_podcast_video = 'error';
                UpdateVideoAttributes({ id, attributes }).catch((error) =>
                  console.log('>> video.save() error:', error)
                );
              });
          }
        })
        .catch((e) => {
          attributes.logs += `> Error proccessing podcast video:\n${e}\n\n`;
          attributes.local_link_podcast_video = 'error';
          UpdateVideoAttributes({ id, attributes }).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });
      attributes.local_link_podcast_video = 'processing';
      return UpdateVideoAttributes({ id, attributes })
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
