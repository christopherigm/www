import type { NextRequest } from 'next/server';
import getSong from '@/lib/get-song';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const name = body?.name ?? null;
  const prompt = body?.prompt ?? null;
  const llmLyrics = body?.llmLyrics ?? null;
  const lyricsStyle = body?.lyricsStyle ?? null;
  const songStyle = body?.songStyle ?? null;
  const compiledStyle = body?.compiledStyle ?? null;
  const llmSongStyle = body?.llmSongStyle ?? null;
  const songStyleBoost = body?.songStyleBoost ?? false;
  const model = body?.model ?? 'V5';
  const instrumental = body?.instrumental ?? false;
  if (!name || !llmLyrics) {
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
  console.log('>> API Generate Song');
  console.log('>> id:', id);
  console.log('>> name:', name);
  console.log('>> prompt:', prompt);
  console.log('>> songStyle:', songStyle);
  console.log('>> compiledStyle:', compiledStyle);
  console.log('>> llmSongStyle:', llmSongStyle);
  console.log('>> songStyleBoost:', songStyleBoost);
  return getSong({
    ...(id && { id }),
    name,
    prompt,
    llmLyrics,
    lyricsStyle,
    songStyle,
    compiledStyle,
    llmSongStyle,
    model,
    songStyleBoost,
    instrumental,
  })
    .then((response: unknown) => Response.json(response, { status: 200 }))
    .catch((error) => Response.json({ error }, { status: 400 }));
}
