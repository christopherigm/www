import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import OllamaQuery from '@repo/helpers/ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export type ScriptInteraction = {
  speakerID: number;
  text: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const language = body?.language ?? '';
  const codeLanguage = body?.codeLanguage ?? '';
  const speakers: Array<string> = body?.speakers ?? ['chris', 'brandon'];
  const mood = body?.mood ?? '';
  const name = body?.name ?? '';
  const instrucctions = body?.instrucctions ?? '';
  const length = body?.length ?? 'medium';
  if (!id || !language || !codeLanguage) {
    return Response.json(
      {
        id: '',
        status: 'error',
        url: '',
        error: 'No data provided',
      },
      {
        status: 400,
      }
    );
  }

  return GetVideoByID(id)
    .then(async (video) => {
      console.log('=====================================');
      console.log('Processing podcast script #', video.id);
      video.attributes.logs += '\n\n> processing podcast script! \n\n';
      video.attributes.podcast_language = codeLanguage;
      video.attributes.podcast_script = 'processing';
      await UpdateVideoAttributes(video)
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
      // video.attributes.podcast_script = 'processing';
      // UpdateVideoAttributes(video).catch((error) =>
      //   console.log('>> video.save() error:', error)
      // );

      const podcast_script = video.attributes.clean_transcriptions
        .replaceAll('\r', '\n')
        .replaceAll('\n', '. ')
        .replaceAll('...', '')
        .replaceAll('"', '')
        .replaceAll('/', '')
        .replaceAll('”', '')
        .replaceAll('“', '');

      const users = speakers
        .map((i, id) => `"${i}" speakerID=${id + 1}`)
        .join(', ');

      let system = 'You are a very skilled Scriptwriter that writes ';
      system += `${length} and creative podcast scripts for the internet `;
      system += 'with small / short user interactions. ';
      let prompt = `Write a podcast script in ${language} `;
      if (speakers.length > 1) {
        prompt += `between ${speakers.length} persons: ${users}, `;
        prompt += `${speakers[0]} is the host of the podcats and `;
        prompt += `${speakers[1]} is the guest. `;
        prompt += 'The guest asks very interesting questions. ';
        prompt += 'The host answer all the questions. ';
      } else {
        prompt += `as a monologue where the host name is ${users}, `;
      }
      prompt += `using the following text: "${podcast_script}". `;
      if (name) {
        prompt += `The name of the podcast is: "${name}" `;
      }
      if (mood) {
        prompt += `Overall script mood must be "${mood}". `;
      }
      if (instrucctions) {
        prompt += 'Also use the following instructions to create ';
        prompt += `the script of the podcast: "${instrucctions}". `;
      }
      // prompt += 'The script must have short interactions. ';
      prompt += 'The script must start with a welcome message. ';
      prompt += `The script must be ${length} and with multiple interactions. `;
      prompt +=
        'Respond only in plain text. Do not use bold, italics, or other special formatting. ';
      prompt +=
        'Do not include any prefatory, framing, or explanatory text. Provide only the answer. ';
      prompt += 'Do not quoute the text. ';
      prompt += 'Do not include references to the text. ';
      prompt += 'Do not respond unicode or hexadecimal. ';
      prompt += 'Use your kownledge along with the text to create the script. ';
      prompt += `All the text of the script must be wirrten in ${language}. `;
      prompt += `Respond only in ${language}.`;

      // console.log('prompt', prompt);

      const format = zodToJsonSchema(
        z.object({
          script: z.array(
            z.object({
              speakerID: z.number(),
              text: z.string(),
            })
          ),
        })
      );
      console.log('OllamaQuery', system, body);
      OllamaQuery({
        prompt,
        system,
        format,
      })
        .then((query) => {
          let podcastArray: Array<ScriptInteraction> = [];
          try {
            podcastArray = JSON.parse(query.response).script;
          } catch {
            console.log('parse error:', query.response);
            podcastArray = [];
          }
          if (podcastArray.length) {
            const cleanArray = podcastArray.map((v) => {
              v.text = v.text
                .replaceAll('<0xC2>', '')
                .replaceAll('<0xA0>', '')
                .replaceAll('<0xA8>', '')
                .replaceAll('<0x80>', '')
                .replaceAll('<0x83>', '')
                .replaceAll('<0xE2>', '')
                .replaceAll('</div>', '')
                .replaceAll('¡', '')
                .replaceAll('!', '')
                .replaceAll(':', '. ')
                .replaceAll('…', ',')
                .replaceAll('“', '"')
                .replaceAll('”', '".')
                .replaceAll('‘', "'")
                .replaceAll('’', "'.")
                .replaceAll('..', '')
                .replaceAll('*', '')
                .replaceAll('{', '')
                .replaceAll('}', '');
              return v;
            });
            video.attributes.podcast_script = JSON.stringify(cleanArray);
            console.log('Done podcast script!');
          } else {
            console.log(prompt);
            video.attributes.podcast_script = 'error';
            video.attributes.logs += '> error processing podcast script! \n\n';
            video.attributes.logs += `> prompt: ${prompt} \n\n`;
          }
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        })
        .catch((error) => {
          console.log(error);
          console.log('Error, prompt:', prompt);
          video.attributes.podcast_script = 'error';
          video.attributes.logs += '> error processing podcast script! \n\n';
          video.attributes.logs += `> prompt: ${prompt} \n\n`;
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });
      return Response.json({ data: 'processing' }, { status: 200 });
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
