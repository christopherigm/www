import type { NextRequest } from 'next/server';
import getVideoName from '@/lib/get-video-name';
import type Item from '@/types/items';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body?.url ?? null;
  if (!url) {
    return Response.json(
      {
        id: '',
        status: 'error',
        url: '',
        error: 'No url provided',
      },
      {
        status: 400,
      }
    );
  }
  const justAudio = body?.justAudio ?? false;
  const hdTikTok = body?.hdTikTok !== undefined ? body.hdTikTok : false;
  const FPS60 = body?.FPS60 ?? false;
  return getVideoName(url, justAudio, hdTikTok, FPS60)
    .then((item: Item) =>
      Response.json(item, {
        status: 200,
      })
    )
    .catch((error) =>
      Response.json(error.toString(), {
        status: 400,
      })
    );
}
