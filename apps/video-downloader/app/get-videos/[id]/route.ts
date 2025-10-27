import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getItem } from '@/lib/item';
import type Item from '@/types/items';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id ?? '';
  const queryItem: Item = {};
  if (id) {
    const newMongoID = new ObjectId(id);
    queryItem._id = newMongoID;
    return getItem(queryItem)
      .then((item) => {
        if (item) {
          return Response.json(item, {
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
  return Response.json(
    {},
    {
      status: 404,
    }
  );
}
