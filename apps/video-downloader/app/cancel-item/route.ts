import type { NextRequest } from 'next/server';
import { getSong, updateSong } from '@/lib/song';
import Song from '@/types/song';

export async function GET(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const id = reqUrl.searchParams.get('id') ?? '';

  return getSong({ id })
    .then((item) => {
      if (!item) {
        return Response.json(
          { data: null },
          {
            status: 404,
          }
        );
      }
      item.status = 'ready';
      return updateSong(item)
        .then((updated: Song) => Response.json(updated, { status: 200 }))
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
