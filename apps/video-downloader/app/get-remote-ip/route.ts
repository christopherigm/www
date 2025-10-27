import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const ipAddress =
    req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '';

  return Response.json(
    {
      ip: ipAddress,
    },
    {
      status: 200,
    }
  );
}
