import type { NextRequest } from 'next/server';
import DownloadSubtitle, {
  type Response,
} from '@repo/helpers/download-subtitles';
import DownloadVideo from '@repo/helpers/download-video';
import DownloadImage from '@repo/helpers/download-image';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isFacebook from '@repo/helpers/is-facebook-checker';
import { DjangoDateTimeField } from '@repo/helpers/date-parser';
import Languages from '@repo/interfaces/languages';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import UpdateAnalysisAttributes from '@/lib/update-analysis-attributes';
import isInstagram from '@repo/helpers/is-instagram-checker';
import { VideoAttributesType } from '@/state/video-type';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  if (!id) {
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

  const ipAddress =
    req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '';

  GetVideoByID(id)
    .then((video) => {
      console.log('=====================================');
      console.log('Processing get subtitles for video #', id);
      const attributes: VideoAttributesType = { logs: video.attributes.logs };
      const link = video.attributes.link;
      const uuid = video.attributes.uuid;
      const thumbnail = video.attributes.thumbnail;
      const locaLink = video.attributes.local_link;
      const language = video.attributes.language;
      const requestedCaptionsLanguage =
        video.attributes.requested_captions_language;
      const requestedSubtitlesLanguage =
        video.attributes.requested_subtitles_language;
      attributes.logs += '> processing get subtitles! \n\n';
      attributes.ip_address = ipAddress;
      attributes.started = DjangoDateTimeField(new Date().toString());

      const promises: Array<Promise<string | null>> = [];

      if (isTiktok(link) || isFacebook(link) || isInstagram(link)) {
        promises.push(
          new Promise((res, rej) => {
            DownloadVideo({
              url: link,
              name: `${uuid}.mp4`,
            })
              .then((value: string) => {
                attributes.local_link = value;
                attributes.logs += '> DownloadVideo OK!\n\n';
                res(value);
              })
              .catch((e) => {
                attributes.logs += 'Error DownloadVideo:\n\n';
                attributes.logs += e.toString() + '\n\n';
                rej(e);
              });
          })
        );
      }

      if (thumbnail) {
        promises.push(
          new Promise((res, rej) => {
            DownloadImage({
              url: thumbnail,
              name: uuid,
            })
              .then((value: string) => {
                attributes.thumbnail = value;
                attributes.logs += '> Download Thumbnail OK!\n\n';
                res(value);
              })
              .catch((e) => {
                attributes.logs += 'Error Download Thumbnail:\n\n';
                attributes.logs += e.toString() + '\n\n';
                rej(e);
              });
          })
        );
      }

      Promise.all(promises)
        .then(() => {
          const SRTFile = `${uuid}.original.srt`;
          DownloadSubtitle({
            url: link,
            localLink: locaLink,
            dest: SRTFile,
            ...(language && {
              videoLanguage: language,
            }),
            ...(requestedCaptionsLanguage && {
              requestedCaptionsLanguage,
            }),
            ...(requestedSubtitlesLanguage && {
              requestedSubtitlesLanguage,
            }),
          })
            .then((data: Response) => {
              attributes.logs += '> Subtitles OK! \n\n';
              if (data && data.cleanSubtitles) {
                if (data.name) {
                  attributes.name = data.name.substring(0, 254);
                }
                attributes.local_link_original_srt = data.srt_file;
                attributes.transcriptions = data.subtitles;
                attributes.clean_transcriptions = data.cleanSubtitles;
                if (data.language) {
                  attributes.language = data.language as Languages;
                }
              }
              attributes.ended = DjangoDateTimeField(new Date().toString());
              attributes.status = data.subtitles ? 'done' : 'error';
              UpdateVideoAttributes({ id, attributes }).catch((error) =>
                console.log('>> video.save() error:', error)
              );
            })
            .catch((e) => {
              attributes.logs += `> Error proccessing the video:\n${e}\n\n`;
              attributes.status = 'error';
              UpdateVideoAttributes({ id, attributes }).catch((error) =>
                console.log('>> video.save() error:', error)
              );
              const analysis = video.relationships.analysis.data.find(
                (i) => i.attributes.status === 'processing'
              );
              if (analysis) {
                analysis.attributes.status = 'error';
                UpdateAnalysisAttributes(analysis).catch((error) =>
                  console.log('>> GetAnalysisByID error:', error)
                );
              }
            });
        })
        .catch((e) => {
          console.log('>> All promises error:');
          attributes.logs += `> Error proccessing the video:\n${e}\n\n`;
          attributes.status = 'error';
          UpdateVideoAttributes({ id, attributes }).catch((error) =>
            console.log('>> video.save() error:', error)
          );
          const analysis = video.relationships.analysis.data.find(
            (i) => i.attributes.status === 'processing'
          );
          if (analysis) {
            analysis.attributes.status = 'error';
            UpdateAnalysisAttributes(analysis).catch((error) =>
              console.log('>> GetAnalysisByID error:', error)
            );
          }
        });
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
    });

  return Response.json({ data: 'processing' }, { status: 200 });
}
