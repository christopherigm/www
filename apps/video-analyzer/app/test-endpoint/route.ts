import type { NextRequest } from 'next/server';
import DownloadVideoAndLoop from '@repo/helpers/download-video-and-loop';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body?.url ?? null;
  const dest = body?.dest ?? null;
  const timeLength = Number(body?.timeLength ?? 0);
  if (!url || !dest) {
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

  return DownloadVideoAndLoop({
    url,
    dest,
    timeLength,
  })
    .then(() => {
      console.log('>> DuplicateVideoXTimes Complete!!!');
      return Response.json({ data: 'OK xd' }, { status: 200 });
    })
    .catch((error) => {
      console.log('>> DuplicateVideoXTimes error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
