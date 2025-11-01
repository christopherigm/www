import fs from 'fs';
import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import BurnSRTIntoVideo from '@repo/helpers/burn-srt-into-video';
import OllamaQuery from '@repo/helpers/ollama';
import RandomNumber from '@repo/helpers/random-number';
import SRTToText from '@repo/helpers/srt-to-text';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type DictTranscription = {
  [key: string]: {
    time: string;
    text: string;
  };
};

type StructuredTranscription = {
  id: string;
  time: string;
  text: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const destination_language = body?.destination_language ?? null;
  if (!id || !destination_language) {
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
      const originalFile = video.attributes.local_link_translated;
      console.log('Processing video #', video.id);
      video.attributes.logs += '\n\n> processing srt video! \n\n';
      // video.attributes.local_link_translated = 'processing';
      // UpdateVideoAttributes(video).catch((error) =>
      //   console.log('>> video.save() error:', error)
      // );
      const splittedTranscriptions = video.attributes.transcriptions
        .replaceAll('\r', '\n')
        .split('\n');

      // console.log('splittedTranscriptions:', splittedTranscriptions);
      const dict: DictTranscription = {};

      let lastID = '';
      splittedTranscriptions.map((i: string) => {
        // console.log(index, 'i:', i);
        if (!isNaN(Number(i)) && !dict[i] && i !== '' && i.length < 3) {
          dict[i] = {
            time: '',
            text: '',
          };
          lastID = i;
        } else if (i.search('-->') > -1 && dict[lastID]) {
          dict[lastID].time = i;
        } else if (dict[lastID]) {
          dict[lastID].text += i + ' ';
        }
      });
      // console.log('dict:', dict);

      const structuredTranscriptions: Array<StructuredTranscription> = [];

      Object.keys(dict).map((key) => {
        structuredTranscriptions.push({
          id: key,
          time: dict[key].time,
          text: dict[key].text,
        });
      });

      if (!structuredTranscriptions.length) {
        video.attributes.local_link_translated = 'error';
        return UpdateVideoAttributes(video)
          .then(() => Response.json({ data: 'processing' }, { status: 200 }))
          .catch((error) => console.log('>> video.save() error:', error));
        // UpdateVideoAttributes(video).catch((error) =>
        //   console.log('>> video.save() error:', error)
        // );
      }
      // console.log('To be translated length:', structuredTranscriptions.length);

      const promises: Array<Promise<string>> = [];
      let system = 'You are a very skilled linguistic that translates ';
      system += 'text from one language to another. ';

      structuredTranscriptions.map((v: StructuredTranscription) => {
        promises.push(
          new Promise((res) => {
            let prompt = 'Translate the following text: ';
            prompt += `"${v.text}" to ${destination_language}. `;
            prompt += 'Respond just with the translation.';
            OllamaQuery({
              prompt,
              system,
            })
              .then((data) => res(data.response))
              .catch((e) => {
                console.log('>> Error translating:', v.text);
                console.log('>> Error:', e.toString());
                res('--');
              });
          })
        );
      });

      Promise.all(promises)
        .then((translatedArray: Array<string>) => {
          let srt = '';
          structuredTranscriptions.map((v, index: number) => {
            const text = translatedArray[index].replaceAll('"', '');
            srt += `${v.id}\n${v.time}\n${text ?? ''}\n\n`;
          });
          const sufix = RandomNumber(1, 99999);
          const src_video = video.attributes.local_link;
          const dest_video = `${video.attributes.uuid}-${destination_language}.${sufix}.sub.mp4`;
          BurnSRTIntoVideo({
            src_video,
            dest_video,
            srt_string: srt,
          })
            .then((value) => {
              console.log('Video completed! #', video.id);
              try {
                const rootFolder =
                  nodeEnv == 'production' ? '/app/' : 'public/';
                fs.rmSync(`${rootFolder}/${originalFile}`);
              } catch {}
              video.attributes.local_link_translated = value;
              video.attributes.translated_transcriptions = srt;
              video.attributes.translated_clean_transcriptions = SRTToText(srt);
              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
            })
            .catch((error) => {
              console.log(error);
              video.attributes.logs += `> BurnSRTIntoVideo Error: ${JSON.stringify(error)} \n\n`;
              video.attributes.logs += `> srt: ${srt} \n\n`;
              video.attributes.logs += `> BurnSRTIntoVideo Error src_video: ${src_video} \n\n`;
              video.attributes.local_link_translated = 'error';
              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
            });
        })
        .catch((error) => {
          console.log('>> Error creating the video', error);
          video.attributes.local_link_translated = 'error';
          video.attributes.logs += `> Error creating the video: ${JSON.stringify(error)} \n\n`;
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });

      video.attributes.local_link_translated = 'processing';
      return UpdateVideoAttributes(video)
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
