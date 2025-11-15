import type { NextRequest } from 'next/server';
import DownloadAudioAndLoop from '@repo/helpers/download-audio-and-loop';
import {
  BackgroundMusicAttributesType,
  BackgroundMusicType,
} from '@/state/background-music-type';
import { APIGetMusicByID, APIUpdateMusic } from '@/lib/crud-music';
import VideoDetails, {
  YouTubePayload,
} from '@repo/helpers/video-details-from-url';
import DownloadImage from '@repo/helpers/download-image';

const UpdateMusicObject = (
  id: string,
  attributes: BackgroundMusicAttributesType
) =>
  APIUpdateMusic(id, attributes).catch((e) =>
    console.log('>> UpdateBackground error:', e)
  );

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const url = body?.url ?? null;
  const timeLength = Number(body?.timeLength ?? 0);
  if (!url || !timeLength) {
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

  APIGetMusicByID(id)
    .then((music: BackgroundMusicType) => {
      UpdateMusicObject(id, {
        status: 'processing',
        link: url,
        time_length: timeLength,
      });
      const dest = `${music.attributes.uuid}.wav`;
      DownloadAudioAndLoop({
        url,
        dest,
        timeLength,
      })
        .then((local_link) => {
          VideoDetails({ url })
            .then((data: YouTubePayload) => {
              if (!data.thumbnail) {
                return UpdateMusicObject(id, {
                  status: 'done',
                  local_link,
                  author: data.uploader || data.artist || data.channel,
                  name: data.title,
                });
              }
              DownloadImage({
                url: data.thumbnail,
                name: music.attributes.uuid,
              })
                .then((value: string) => {
                  UpdateMusicObject(id, {
                    status: 'done',
                    local_link,
                    author: data.uploader || data.artist || data.channel,
                    name: data.title,
                    thumbnail: value,
                  });
                })
                .catch(() => {
                  UpdateMusicObject(id, {
                    status: 'done',
                    local_link,
                    author: data.uploader || data.artist || data.channel,
                    name: data.title,
                  });
                });
            })
            .catch((e) =>
              UpdateMusicObject(id, {
                status: 'error',
                logs: e.toString(),
              })
            );
        })
        .catch((e) =>
          UpdateMusicObject(id, {
            status: 'error',
            logs: e.toString(),
          })
        );
    })
    .catch((e) => console.log('>> DownloadVideoAndLoop error:', e));
  return Response.json({ status: 'ok' }, { status: 200 });
}
