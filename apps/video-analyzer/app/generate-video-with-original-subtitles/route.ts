import fs from 'fs';
import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import BurnSRTIntoVideo from '@repo/helpers/burn-srt-into-video';
import RandomNumber from '@repo/helpers/random-number';
import { VideoAttributesType } from '@/state/video-type';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
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
    .then((video) => {
      console.log('=====================================');
      const attributes: VideoAttributesType = {
        logs: video.attributes.logs,
      };
      const originalFile = video.attributes.local_link_sub;
      const uuid = video.attributes.uuid;
      const localLink = video.attributes.local_link;
      const transcriptions = video.attributes.transcriptions;
      console.log('Processing srt video #', id);
      attributes.logs += '> processing srt video! \n\n';

      const promises: Array<Promise<string>> = [];
      promises.push(
        new Promise((res, rej) => {
          const sufix = RandomNumber(1, 99999);
          const src_video = localLink;
          const dest_video = `${uuid}.${sufix}.sub.mp4`;

          BurnSRTIntoVideo({
            srt_string: transcriptions,
            src_video,
            dest_video,
          })
            .then((value) => res(value))
            .catch((e) => rej(e));
        })
      );

      Promise.all(promises)
        .then((data) => {
          if (data && data.length) {
            try {
              const rootFolder = nodeEnv == 'production' ? '/app/' : 'public/';
              fs.rmSync(`${rootFolder}/${originalFile}`);
            } catch {}
            attributes.local_link_sub = data[0] ?? '';
            console.log('videoSRTCommand OK!');
            UpdateVideoAttributes({ id, attributes }).catch((error) =>
              console.log('>> video.save() error:', error)
            );
          }
        })
        .catch((e) => {
          attributes.logs += `> Error proccessing the video:\n${e}\n\n`;
          attributes.local_link_sub = 'error';
          UpdateVideoAttributes({ id, attributes }).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });

      attributes.local_link_sub = 'processing';
      return UpdateVideoAttributes({ id, attributes })
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
