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
      video.attributes.ip_address = ipAddress;
      video.attributes.started = DjangoDateTimeField(new Date().toString());
      video.attributes.logs += '> processing! \n\n';
      const promises: Array<Promise<string | null>> = [];

      if (
        isTiktok(video.attributes.link) ||
        isFacebook(video.attributes.link) ||
        isInstagram(video.attributes.link)
      ) {
        promises.push(
          new Promise((res, rej) => {
            DownloadVideo({
              url: video.attributes.link,
              name: `${video.attributes.uuid}.mp4`,
            })
              .then((value: string) => {
                video.attributes.local_link = value;
                video.attributes.logs += '> DownloadVideo OK!\n\n';
                res(value);
              })
              .catch((e) => {
                video.attributes.logs += 'Error DownloadVideo:\n\n';
                video.attributes.logs += e.toString() + '\n\n';
                // video.attributes.status = 'error';
                // UpdateVideoAttributes(video)
                //   .then(() => res(null))
                //   .catch((error) =>
                //     console.log('>> video.save() error:', error)
                //   );
                rej(e);
              });
          })
        );
      }

      if (video.attributes.thumbnail) {
        promises.push(
          new Promise((res, rej) => {
            DownloadImage({
              url: video.attributes.thumbnail,
              name: video.attributes.uuid,
            })
              .then((value: string) => {
                video.attributes.thumbnail = value;
                video.attributes.logs += '> Download Thumbnail OK!\n\n';
                res(value);
              })
              .catch((e) => {
                video.attributes.logs += 'Error Download Thumbnail:\n\n';
                video.attributes.logs += e.toString() + '\n\n';
                // video.attributes.status = 'error';
                // UpdateVideoAttributes(video)
                //   .then(() => res(null))
                //   .catch((error) =>
                //     console.log('>> video.save() error:', error)
                //   );
                rej(e);
              });
          })
        );
      }

      Promise.all(promises)
        .then(() => {
          const SRTFile = `${video.attributes.uuid}.original.srt`;
          DownloadSubtitle({
            url: video.attributes.link,
            localLink: video.attributes.local_link,
            dest: SRTFile,
            ...(video.attributes.language && {
              videoLanguage: video.attributes.language,
            }),
            ...(video.attributes.requested_captions_language && {
              requestedCaptionsLanguage:
                video.attributes.requested_captions_language,
            }),
            ...(video.attributes.requested_subtitles_language && {
              requestedSubtitlesLanguage:
                video.attributes.requested_subtitles_language,
            }),
          })
            .then((data: Response) => {
              video.attributes.logs += '> Subtitles OK! \n\n';
              if (data && data.cleanSubtitles) {
                if (data.name) {
                  video.attributes.name = data.name.substring(0, 254);
                }
                video.attributes.local_link_original_srt = data.srt_file;
                video.attributes.transcriptions = data.subtitles;
                video.attributes.clean_transcriptions = data.cleanSubtitles;
                if (data.language) {
                  video.attributes.language = data.language as Languages;
                }
              }
              video.attributes.ended = DjangoDateTimeField(
                new Date().toString()
              );
              video.attributes.status = video.attributes.transcriptions
                ? 'done'
                : 'error';
              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
            })
            .catch((e) => {
              video.attributes.logs += `> Error proccessing the video:\n${e}\n\n`;
              video.attributes.status = 'error';
              UpdateVideoAttributes(video).catch((error) =>
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
          video.attributes.logs += `> Error proccessing the video:\n${e}\n\n`;
          video.attributes.status = 'error';
          UpdateVideoAttributes(video).catch((error) =>
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
