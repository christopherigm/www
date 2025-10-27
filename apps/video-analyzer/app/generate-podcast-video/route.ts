import fs from 'fs';
import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import GenerateSRT from '@repo/helpers/generate-srt';
import GetWavLength from '@repo/helpers/get-wav-length';
import ChangeVideoLength from '@repo/helpers/change-video-length';
import BurnSRTIntoVideo from '@repo/helpers/burn-srt-into-video';
import AddAudioToVideoInTime from '@repo/helpers/add-audio-to-video-in-time';
import RandomNumber from '@repo/helpers/random-number';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const videoBackground = body?.videoBackground ?? 'car';
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
      console.log('Processing podacast video #', video.id);
      video.attributes.logs += '\n\n> processing podcast video! \n\n';

      const local_link_podcast_srt = `${video.attributes.uuid}.podcast.srt`;
      GenerateSRT({
        src: video.attributes.local_link_podcast,
        dest: local_link_podcast_srt,
        language:
          video.attributes.podcast_language !== ''
            ? video.attributes.podcast_language
            : 'en',
        output_dir: 'media',
        max_words_per_line: 1,
        model: 'base',
      })
        .then(async (response) => {
          video.attributes.podcast_srt = response.srt;
          video.attributes.local_link_podcast_srt = response.file;

          const local_link_podcast =
            video.attributes.local_link_podcast.replaceAll('media/', '');
          const wavLength = await GetWavLength({ src: local_link_podcast });

          const originalVideo = `video-backgrounds/${videoBackground}.mp4`;
          const videoTmp = video.attributes.uuid + '.podcast-video.tmp.mp4';
          const videoSRT = video.attributes.uuid + '.podcast-video.srt.mp4';

          const sufix = RandomNumber(1, 99999);
          const finalVideo = `${video.attributes.uuid}.podcast-video.${sufix}.mp4`;

          const videoLength = await GetWavLength({ src: originalVideo });
          const setptsFactor = wavLength / videoLength;

          await ChangeVideoLength({
            src: originalVideo,
            dest: videoTmp,
            setptsFactor,
          });
          await BurnSRTIntoVideo({
            src_video: videoTmp,
            dest_video: videoSRT,
            srt_string: video.attributes.podcast_srt,
          });
          await AddAudioToVideoInTime({
            src_video: videoSRT,
            src_audio: local_link_podcast,
            dest: finalVideo,
            offset: 0,
          });

          try {
            const rootFolder = nodeEnv == 'production' ? '/app/' : 'public/';
            fs.rmSync(
              `${rootFolder}/${video.attributes.local_link_podcast_video}`
            );
          } catch {}
          video.attributes.local_link_podcast_video = `media/${finalVideo}`;

          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
          console.log('Podcast SRT from audio completed!');
          const rootFolder =
            nodeEnv == 'production' ? '/app/media' : 'public/media';
          fs.rmSync(`${rootFolder}/${videoTmp}`);
          fs.rmSync(`${rootFolder}/${videoSRT}`);
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
