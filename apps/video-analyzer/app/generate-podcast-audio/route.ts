import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import RandomNumber from '@repo/helpers/random-number';
import GenerateAIAudio from '@repo/helpers/generate-ai-audio';
import GenerateAudioDiarization from '@repo/helpers/generate-audio-diarization';
import GenerateSRT from '@repo/helpers/generate-srt';
import DeleteMediaFile from '@repo/helpers/delete-media-file';
import { VideoAttributesType } from '@/state/video-type';

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
      console.log('Processing podcast audio Podcast for video #', id);
      const attributes: VideoAttributesType = { logs: video.attributes.logs };
      attributes.logs += '\n\n> processing podcast audio! \n\n';
      const originalFile = video.attributes.local_link_podcast;
      const podcastScript = video.attributes.podcast_script;
      const podcastLanguage = video.attributes.podcast_language;
      const uuid = video.attributes.uuid;

      const interactions: Array<PodcastInteraction> = JSON.parse(
        podcastScript ?? '[]'
      );
      let text = '';
      interactions.map((i: PodcastInteraction) => {
        text += `Speaker ${i.speakerID}: ${i.text}\n`;
      });
      const sufix = RandomNumber(1, 99999);
      const dest = `${uuid}.podcast.${sufix}`;
      GenerateAIAudio({ dest, text, speakers })
        .then((generatedWav) => {
          DeleteMediaFile(originalFile);
          attributes.local_link_podcast = generatedWav;
          GenerateAudioDiarization({
            name: generatedWav,
          })
            .then((response) => {
              attributes.local_link_podcast_diarization = response.file;
              attributes.podcast_diarization = response.diarization;
              const local_link_podcast_srt = `${uuid}.podcast.srt`;
              GenerateSRT({
                src: generatedWav,
                dest: local_link_podcast_srt,
                language: podcastLanguage !== '' ? podcastLanguage : 'en',
                output_dir: 'media',
                max_words_per_line: 1,
                model: 'base',
              })
                .then((response) => {
                  if (!response.srt) {
                    attributes.local_link_podcast_video = 'error';
                    return UpdateVideoAttributes({
                      id,
                      attributes,
                    }).catch((error) =>
                      console.log('>> video.save() error:', error)
                    );
                  }
                  attributes.podcast_srt = response.srt;
                  attributes.local_link_podcast_srt = response.file;
                  UpdateVideoAttributes({
                    id,
                    attributes,
                  }).catch((error) =>
                    console.log('>> video.save() error:', error)
                  );
                })
                .catch((e) => {
                  attributes.logs += `> Error proccessing podcast video:\n${e}\n\n`;
                  attributes.local_link_podcast_video = 'error';
                  UpdateVideoAttributes({
                    id,
                    attributes,
                  }).catch((error) =>
                    console.log('>> video.save() error:', error)
                  );
                });
            })
            .catch((e) => {
              console.log('GenerateAudioDiarization Error:', e);
            });
        })
        .catch((e) => {
          console.log('>> Post voice AI error:', e);
          attributes.local_link_podcast = 'error';
          UpdateVideoAttributes({
            id,
            attributes,
          }).catch((error) => console.log('>> video.save() error:', error));
        });

      attributes.local_link_podcast = 'processing';
      return UpdateVideoAttributes({
        id,
        attributes,
      })
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}
