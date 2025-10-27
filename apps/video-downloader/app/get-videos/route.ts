import { getAllItems } from '@/lib/item';
import { Document } from 'mongodb';

export async function GET() {
  return getAllItems({})
    .then((items: Array<Document>) => {
      if (items && items.length) {
        items.map((i) => (i.version = process.env.VERSION));
        return Response.json(items[0], {
          status: 200,
        });
      }
      return Response.json(
        {},
        {
          status: 404,
        }
      );
    })
    .catch((error) =>
      Response.json(error.toString(), {
        status: 400,
      })
    );
}
