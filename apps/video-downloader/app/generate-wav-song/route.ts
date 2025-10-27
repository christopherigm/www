import type { NextRequest } from 'next/server';
import getWavSong from '@/lib/get-wav-song';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const songId = body?.songId ?? null;
  if (!songId || !id) {
    return Response.json(
      {
        id: '',
        status: 'error',
        url: '',
        error: 'No id provided',
      },
      {
        status: 400,
      }
    );
  }
  console.log('>> API Generate Song');
  console.log('>> id:', id);
  return getWavSong({ id, songId })
    .then((response: unknown) => Response.json(response, { status: 200 }))
    .catch((error) => Response.json({ error }, { status: 400 }));
}
