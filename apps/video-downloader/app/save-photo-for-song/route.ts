import type { NextRequest } from 'next/server';
import SaveBase64Images from '@/lib/save-base64-images';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const songId = body?.songId ?? null;
  const image = body?.image ?? null;
  if (!songId || !image) {
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
  return SaveBase64Images(songId, [image])
    .then(() => Response.json({ success: true }, { status: 200 }))
    .catch((error) => {
      console.log('>> API Save Photo');
      console.log('>> songId:', songId);
      console.log('>> error:', error);
      return Response.json({ error }, { status: 400 });
    });
}
