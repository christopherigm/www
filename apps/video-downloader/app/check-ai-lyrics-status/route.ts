import type { NextRequest } from 'next/server';
import { getOrCreateSong } from '@/lib/song';
import Song from '@/types/song';

export async function GET(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const id = reqUrl.searchParams.get('id') ?? '';
  return getOrCreateSong({ id })
    .then((item: Song) => Response.json(item, { status: 200 }))
    .catch((error) => Response.json(error.toString(), { status: 400 }));
}
