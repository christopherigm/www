import type { NextRequest } from 'next/server';
import getPhotoVideoSong from '@/lib/get-photo-video-song';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const songId = body?.songId ?? null;
  const aspectRatio = body?.aspectRatio ?? 'portrait';
  const displayLyrics = body?.displayLyrics ?? null;
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
  console.log('>> API Generate Photo Video');
  console.log('>> id:', id);
  console.log('>> songId:', songId);
  console.log('>> aspectRatio:', aspectRatio);
  console.log('>> displayLyrics:', displayLyrics);
  return getPhotoVideoSong({ id, songId, aspectRatio, displayLyrics })
    .then((response: unknown) => Response.json(response, { status: 200 }))
    .catch((error) => Response.json({ error }, { status: 400 }));
}
