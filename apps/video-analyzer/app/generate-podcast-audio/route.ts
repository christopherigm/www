import fs from 'fs';
import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import RandomNumber from '@repo/helpers/random-number';
import GenerateAIAudio from '@repo/helpers/generate-ai-audio';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type PodcastInteraction = {
  speakerID: number;
  text: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const rawSpeakers: Array<string> = body?.speakers;
  const speakers = rawSpeakers.filter((i) => i !== '' && i !== 'auto');
  if (!id || !speakers.length) {
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

  return GetVideoByID(id)
    .then((video) => {
      console.log('=====================================');
      console.log('Processing podcast audio Podcast for video #', video.id);
      video.attributes.logs += '\n\n> processing podcast audio! \n\n';

      const interactions: Array<PodcastInteraction> = JSON.parse(
        video.attributes.podcast_script ?? '[]'
      );
      let text = '';
      interactions.map((i: PodcastInteraction) => {
        text += `Speaker ${i.speakerID}: ${i.text}\n`;
      });
      const sufix = RandomNumber(1, 99999);
      const dest = `${video.attributes.uuid}.podcast.${sufix}`;
      GenerateAIAudio({ dest, text, speakers })
        .then((generatedWav) => {
          try {
            const rootFolder = nodeEnv == 'production' ? '/app/' : 'public/';
            fs.rmSync(`${rootFolder}/${video.attributes.local_link_podcast}`);
          } catch {}
          video.attributes.local_link_podcast = generatedWav;
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        })
        .catch((e) => {
          console.log('>> Post voice AI error:', e);
          video.attributes.local_link_podcast = 'error';
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });

      video.attributes.local_link_podcast = 'processing';
      return UpdateVideoAttributes(video)
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
  // return Response.json({ data: 'processing' }, { status: 200 });
}
