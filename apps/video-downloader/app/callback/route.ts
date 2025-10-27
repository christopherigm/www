import type { NextRequest } from 'next/server';
import { exec } from 'child_process';
import Song, { APISong } from '@/types/song';
import { getSongByTaskID, updateSong } from '@/lib/song';
import { mediaPath } from '@/config';

type Callback = {
  code: number;
  data: {
    callbackType: string; // "complete"
    task_id: string;
    data: Array<APISong>;
  };
};

// >>>> Callback!: {
//   code: 200,
//   data: {
//     task_id: 'e46a2af2187c1c38e435626e86059582',
//     video_url: 'https://tempfile.aiquickdraw.com/s/e46a2af2187c1c38e435626e86059582.mp4'
//   },
//   msg: 'All generated successfully.'
// }

export async function POST(req: NextRequest) {
  const body: Callback = await req.json();
  console.log('>>>> Callback!:', body);

  if (
    body.code &&
    body.code === 200 &&
    body.data &&
    body.data.callbackType &&
    body.data.callbackType === 'complete' &&
    body.data.task_id &&
    body.data.data &&
    body.data.data.length
  ) {
    return getSongByTaskID(body.data.task_id)
      .then((item) => {
        if (item) {
          item.status = 'ready';
          item.retrying = false;
          item.songs = body.data.data;
          const filesPromises: Array<Promise<void>> = [];
          item.songs = item.songs.map((v: APISong) => {
            const appUrl = `ai-music/${item.name}-${v.id}.mp3`;
            filesPromises.push(
              new Promise((res, rej) => {
                let command = `wget ${v.sourceAudioUrl} `;
                command += `-O "${mediaPath}/${appUrl}"`;
                exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
                  if (error) {
                    console.log('exec error', error);
                    return rej(error);
                  }
                  return res();
                });
              })
            );
            const appImageUrl = `ai-music/${item.name}-${v.id}.jpeg`;
            filesPromises.push(
              new Promise((res, rej) => {
                let command = `wget ${v.imageUrl} `;
                command += `-O "${mediaPath}/${appImageUrl}"`;
                exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
                  if (error) {
                    console.log('exec error', error);
                    return rej(error);
                  }
                  return res();
                });
              })
            );
            v.appUrl = appUrl;
            v.appImageUrl = appImageUrl;
            return v;
          });
          return Promise.all(filesPromises)
            .then(() => {
              return updateSong(item)
                .then((updated: Song) => {
                  return Response.json(updated, { status: 200 });
                })
                .catch((error) =>
                  Response.json(error.toString(), {
                    status: 400,
                  })
                );
            })
            .catch((error) =>
              Response.json(error.toString(), {
                status: 400,
              })
            );
        }
        return Response.json('no item', {
          status: 400,
        });
      })
      .catch((error) =>
        Response.json(error.toString(), {
          status: 400,
        })
      );
  }
}
