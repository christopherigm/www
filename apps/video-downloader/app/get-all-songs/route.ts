import { getAllSongs } from '@/lib/song';
// https://apibox.erweima.ai/api/v1/generate/credit

export async function GET() {
  return getAllSongs({})
    .then((response: Array<unknown>) => {
      return Response.json(response, {
        status: 200,
      });
    })
    .catch((error) => {
      Response.json(error.toString(), {
        status: 400,
      });
    });
}
