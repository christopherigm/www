import type { NextRequest } from 'next/server';
import deleteSingleSong from '@/lib/delete-single-song';

export async function DELETE(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const id = reqUrl.searchParams.get('id') ?? '';
  const songId = reqUrl.searchParams.get('songId') ?? '';
  console.log('>> API DELETE Song');
  console.log('>> id:', id);
  console.log('>> songId:', songId);
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
  return deleteSingleSong({ id, songId })
    .then((response: unknown) => Response.json(response, { status: 200 }))
    .catch((error) => Response.json({ error }, { status: 400 }));
}
