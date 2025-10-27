import type { NextRequest } from 'next/server';
import ollamaQuery from '@/app/llm-query/ollama';
import { getOrCreateSong, updateSong } from '@/lib/song';
import Song from '@/types/song';
import { GenerateResponse } from 'ollama';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body?.name ?? null;
  const prompt = body?.prompt ?? null;
  const lyricsStyle = body?.lyricsStyle ?? null;
  const reference = body?.reference ?? null;
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
  console.log('name:', name);
  console.log('lyricsStyle:', lyricsStyle);
  console.log('reference:', reference?.length ? 'true' : 'false');
  console.log('prompt:', prompt);
  return getOrCreateSong({
    name,
    prompt,
    lyricsStyle,
  })
    .then((i: Song) => {
      const item = { ...i };
      ollamaQuery({ prompt, reference })
        .then((data: GenerateResponse) => {
          if (data && data.response) {
            item.llmLyrics = data.response;
          } else {
            item.llmLyrics = 'Error generating content!';
          }
          updateSong(item).catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
      return Response.json(item, { status: 200 });
    })
    .catch((error) => Response.json(error.toString(), { status: 400 }));
}
