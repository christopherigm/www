import type { NextRequest } from 'next/server';
import { getSong } from '@/lib/song';
import { APICheck } from '@/lib/get-song';

export async function GET(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const id = reqUrl.searchParams.get('id') ?? '';

  return getSong({ id })
    .then((item) => {
      if (!item) {
        return Response.json(
          { data: null },
          {
            status: 404,
          }
        );
      }
      if (
        (item.status === 'error' && item.retrying === false) ||
        (item.status === 'downloading' &&
          item.retrying === true &&
          !item.llmStatus)
      ) {
        item.retrying = true;
        APICheck(item);
      }
      return Response.json(item, { status: 200 });
    })
    .catch((error) =>
      Response.json(error.toString(), {
        status: 400,
      })
    );
}
