import type { NextRequest } from 'next/server';
import DeleteMediaFile from '@repo/helpers/delete-media-file';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const media = body?.media ?? null;
  if (!media) {
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

  DeleteMediaFile(media);

  return Response.json({ status: 'ok' }, { status: 200 });
}
