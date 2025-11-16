import fs from 'fs';
import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import RandomNumber from '@repo/helpers/random-number';
import OllamaQuery from '@repo/helpers/ollama';
import GenerateAIAudio from '@repo/helpers/generate-ai-audio';
import GetWavLength from '@repo/helpers/get-wav-length';
import ChangeVideoLength from '@repo/helpers/change-video-length';
import AddAudioToVideoInTime from '@repo/helpers/add-audio-to-video-in-time';
import { VideoAttributesType } from '@/state/video-type';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const language = body?.language ?? 'Spanish';
  const rawSpeakers: Array<string> = body?.speakers ?? ['Chris'];
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
    .then(async (video) => {
      console.log('=====================================');
      const attributes: VideoAttributesType = { logs: video.attributes.logs };
      const originalFile = video.attributes.local_link_translated_audio;
      const uuid = video.attributes.uuid;
      const originalVideo = video.attributes.local_link;
      const translatedVideoTmp = `${uuid}.translated_audio.tmp.mp4`;
      const sufix = RandomNumber(1, 99999);
      const translatedVideo = `${uuid}.translated_audio-${sufix}.mp4`;
      console.log('Processing translated audio - video #', id);
      attributes.logs += '\n\n> processing video for audio! \n\n';

      const splittedTranscriptions = video.attributes.clean_transcriptions
        .replaceAll('\r', '\n')
        .replaceAll('\n', '')
        .replaceAll('...', '')
        .replaceAll('"', '')
        .replaceAll('/', '')
        .replaceAll('”', '')
        .replaceAll('“', '');

      let system = 'You are a very skilled linguistic that translates ';
      system += 'text from one language to another. ';
      let prompt = 'Translate the following text: ';
      prompt += `"${splittedTranscriptions}" to ${language}. `;
      prompt += 'Respond just with the translation.';
      OllamaQuery({
        prompt,
        system,
        host: 'http://192.168.0.24:11434',
      })
        .then((query) => {
          const cleanText = query.response
            .replaceAll('...', '')
            .replaceAll('"', '')
            .replaceAll('/', '')
            .replaceAll('”', '')
            .replaceAll('“', '')
            .replaceAll('\n', '');
          const text = `Speaker 1: ${cleanText}`;

          const sufix = RandomNumber(1, 99999);
          const dest = `${uuid}.podcast.${sufix}`;
          console.log('>> GenerateAIAudio speakers:', speakers);
          GenerateAIAudio({ dest, text, speakers })
            .then(async (generatedWav) => {
              const wavLength = await GetWavLength({ src: generatedWav });
              const videoLength = await GetWavLength({ src: originalVideo });
              let setptsFactor = Number((wavLength / videoLength).toFixed(2));
              if (setptsFactor < 0.5) {
                setptsFactor = 0.5;
              }
              await ChangeVideoLength({
                src: originalVideo,
                dest: translatedVideoTmp,
                setptsFactor,
              });

              await AddAudioToVideoInTime({
                src_video: translatedVideoTmp,
                src_audio: generatedWav,
                dest: translatedVideo,
                offset: 0,
              });
              const rootFolder = nodeEnv == 'production' ? '/app' : 'public';
              try {
                fs.rmSync(`${rootFolder}/${originalFile}`);
              } catch {}
              attributes.local_link_translated_audio = `media/${translatedVideo}`;
              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
              fs.rmSync(`${rootFolder}/${generatedWav}`);
              fs.rmSync(`${rootFolder}/media/${translatedVideoTmp}`);
            })
            .catch((e) => {
              console.log('>> Post voice AI error:', e);
              attributes.local_link_translated_audio = 'error';
              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
            });
        })
        .catch((e) => {
          console.log('>> Post voice AI error:', e);
          attributes.local_link_translated_audio = 'error';
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });
      attributes.local_link_translated_audio = 'processing';
      return UpdateVideoAttributes(video)
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
