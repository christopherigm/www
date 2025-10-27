import type { NextRequest } from 'next/server';
import VideoDetails, {
  type YouTubePayload,
} from '@repo/helpers/video-details-from-url';

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

  const promises: Array<Promise<YouTubePayload>> = [];

  promises.push(
    new Promise((res, rej) => {
      VideoDetails({ url })
        .then((data: YouTubePayload) => res(data))
        .catch((e) => rej(e));
    })
  );

  return Promise.all(promises)
    .then((responses) => {
      const [data] = responses;
      return Response.json({ data }, { status: 200 });
    })
    .catch((error) => Response.json({ error }, { status: 400 }));
}
