import type { NextRequest } from 'next/server';
import ollamaQuery from '@/app/llm-query/ollama';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt = body?.prompt ?? null;
  if (!prompt) {
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
  const format = body?.format ?? null;
  const images = body?.images ?? null;
  const host = body?.host ?? null;
  const model = body?.model ?? null;
  console.log('Prompt:', prompt);
  return ollamaQuery({
    ...(host && { host }),
    ...(model && { model }),
    prompt,
    format,
    images,
  })
    .then((response: any) => Response.json(response, { status: 200 }))
    .catch((error) => Response.json(error.toString(), { status: 400 }));
}
