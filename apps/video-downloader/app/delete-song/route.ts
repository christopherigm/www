import type { NextRequest } from 'next/server';
import deleteSong from '@/lib/delete-song';

export async function DELETE(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const id = reqUrl.searchParams.get('id') ?? '';
  console.log('>> API DELETE Song');
  console.log('>> id:', id);
  if (!id) {
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
  return deleteSong({ id })
    .then(() => Response.json({}, { status: 200 }))
    .catch((error) => Response.json({ error }, { status: 400 }));
}
