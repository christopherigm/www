import type { NextRequest } from 'next/server';
import DownloadVideoAndLoop from '@repo/helpers/download-video-and-loop';
import VideoDetails, {
  YouTubePayload,
} from '@repo/helpers/video-details-from-url';
import { APIGetByID, APIUpdate } from '@/lib/crud-background-video';
import {
  BackgroundVideoAttributesType,
  BackgroundVideoType,
} from '@/state/background-video-type';

const UpdateBackgroundVideoObject = (
  id: string,
  attributes: BackgroundVideoAttributesType
) =>
  APIUpdate(id, attributes).catch((e) =>
    console.log('>> UpdateBackground error:', e)
  );

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const url = body?.url ?? null;
  const timeLength = Number(body?.timeLength ?? 0);
  const upscaleFPS = Number(body?.upscaleFPS ?? 0);
  const transitionDuration = Number(body?.transitionDuration ?? 3);
  if (!id || !url || !timeLength) {
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

  APIGetByID(id)
    .then((data: BackgroundVideoType) => {
      UpdateBackgroundVideoObject(id, {
        status: 'processing',
        link: url,
        time_length: timeLength,
        ...(upscaleFPS && { fps: upscaleFPS }),
      });
      const dest = `${data.attributes.uuid}.mp4`;
      DownloadVideoAndLoop({
        url,
        dest,
        timeLength,
        upscaleFPS,
        duration: transitionDuration,
      })
        .then((local_link) => {
          VideoDetails({ url })
            .then((data: YouTubePayload) =>
              UpdateBackgroundVideoObject(id, {
                status: 'done',
                local_link,
                author: data.uploader || data.artist || data.channel,
                name: data.title,
              })
            )
            .catch((e) =>
              UpdateBackgroundVideoObject(id, {
                status: 'error',
                logs: e.toString(),
              })
            );
        })
        .catch((e) =>
          UpdateBackgroundVideoObject(id, {
            status: 'error',
            logs: e.toString(),
          })
        );
    })
    .catch((e) => console.log('>> DownloadVideoAndLoop error:', e));
  return Response.json({ status: 'ok' }, { status: 200 });
}
