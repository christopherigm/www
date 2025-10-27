import { exec } from 'child_process';
import fs from 'fs';
import RandomNumber from '@repo/helpers/random-number';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isYoutube from '@repo/helpers/is-youtube-checker';
import GenerateSRT from '@repo/helpers/generate-srt';
import SRTToText from '@repo/helpers/srt-to-text';
import CopyFile from '@repo/helpers/copy-file';

// ./yt-dlp --skip-download --write-auto-sub --sub-lang en
// --convert-subs=none https://youtu.be/12345 -o data

// eslint-disable-next-line turbo/no-undeclared-env-vars
const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type CaptionObject = {
  ext: 'json3' | 'srt';
  url: string;
};
type YouTubePayload = {
  id: string;
  title: string;
  fulltitle: string;
  thumbnail: string;
  automatic_captions: {
    [key: string]: Array<CaptionObject>;
  };
  subtitles: {
    [key: string]: Array<CaptionObject>;
  };
  language: string;
};

type PromiseResponse = {
  name?: string;
  // finalURL?: string;
  language?: string;
  subtitles?: string;
  thumbnail?: string;
};
const createFolder = (folder: string) => {
  // Create temp folder
  if (!fs.existsSync(folder)) {
    try {
      fs.mkdirSync(folder);
    } catch (e) {
      console.log('>>> Warning DownloadSubtitle creating folder!:', e);
    }
  }
};

const deleteFolder = (folder: string) => {
  try {
    fs.rmSync(folder, { recursive: true });
  } catch (e) {
    console.log('>>> Warning DownloadSubtitle deleting folder!:', e);
  }
};

export type Response = {
  subtitles: string;
  cleanSubtitles: string;
  srt_file: string;
  name?: string;
  language?: string;
  finalURL?: string;
  thumbnail?: string;
};

type Props = {
  url: string;
  dest: string;
  localLink?: string;
  outputFolder?: string;
  videoLanguage?: string;
  requestedCaptionsLanguage?: string;
  requestedSubtitlesLanguage?: string;
  linuxBinary?: string;
  cookies?: string;
};

const DownloadSubtitle = ({
  url,
  dest,
  localLink,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
  videoLanguage,
  requestedCaptionsLanguage = '',
  requestedSubtitlesLanguage = '',
  linuxBinary = nodeEnv == 'production' ? 'yt-dlp' : './yt-dlp',
  cookies = nodeEnv == 'production'
    ? '/app/netscape-cookies.txt'
    : './netscape-cookies.txt',
}: Props): Promise<Response> => {
  return new Promise((res, rej) => {
    const dest_clean = dest.replaceAll('media/', '');
    const dest_file = `${outputFolder}/${dest_clean}`;
    const promises: Array<Promise<PromiseResponse>> = [];

    promises.push(
      new Promise((res, rej) => {
        let videoLanguageCommand = linuxBinary;
        videoLanguageCommand += ` --dump-json "${url}" | jq --raw-output`;
        exec(
          videoLanguageCommand,
          { maxBuffer: 1024 * 2048 },
          (error, data: string) => {
            if (error || !data) {
              return rej(error);
            }
            const youtubeData: YouTubePayload = JSON.parse(data);
            const name = youtubeData.fulltitle ?? youtubeData.title ?? '';
            const language = youtubeData.language ?? '';
            const thumbnail = youtubeData.thumbnail ?? '';
            if (requestedCaptionsLanguage || requestedSubtitlesLanguage) {
              let caption: CaptionObject | undefined;
              if (requestedCaptionsLanguage) {
                caption = youtubeData.automatic_captions[
                  requestedCaptionsLanguage
                ]?.find((i) => i.ext === 'srt');
              } else if (requestedSubtitlesLanguage) {
                caption = youtubeData.subtitles[
                  requestedSubtitlesLanguage
                ]?.find((i) => i.ext === 'srt');
              }
              if (!caption || !caption.url) {
                return rej('No captions for selected language');
              }
              // const captionFile = `${folder}/captions.srt`;
              exec(
                `wget -c "${caption.url}" -O ${dest_file} --load-cookies=${cookies}`,
                { maxBuffer: 1024 * 2048 },
                (error) => {
                  if (error) {
                    return rej(error);
                  }
                  const subtitles = fs.readFileSync(dest_file, 'utf8');
                  return res({ name, subtitles, language, thumbnail });
                }
              );
            } else {
              // console.log('>>> detected language:', language);
              return res({ name, language, thumbnail });
            }
          }
        );
      })
    );

    Promise.all(promises)
      .then((data: Array<PromiseResponse>) => {
        let language = '';
        let subtitles = '';
        let cleanSubtitles = '';
        let name = '';
        let thumbnail = '';

        data.map((i: PromiseResponse) => {
          if (i.name) name = i.name;
          if (i.language) language = i.language;
          if (i.subtitles) subtitles = i.subtitles;
          if (i.thumbnail) thumbnail = i.thumbnail;
        });
        // console.log('>>> Promise ALL language:', language);

        if (subtitles) {
          cleanSubtitles = SRTToText(subtitles);
          fs.writeFileSync(dest_file, subtitles, 'utf-8');
          // deleteFolder(folder);
          return res({
            ...(name && { name }),
            srt_file: `media/${dest_clean}`,
            subtitles,
            cleanSubtitles,
            ...(language && { language }),
            // ...(finalURL && { finalURL }),
            ...(thumbnail && { thumbnail }),
          });
        }

        // Main Command - multiple SRT files expected
        if (language.search('-')) {
          language = language.split('-')[0] ?? language;
        }

        // Temporary folder
        // const randomID = RandomNumber(1, 1999);
        const folder = RandomNumber(1, 1999).toString();
        createFolder(`${outputFolder}/${folder}`);

        let command = linuxBinary;
        command += ' --skip-download --write-automatic-subs ';
        command += '--write-subs ';
        if (isTiktok(url)) {
          command += ` --sub-langs "all" `;
        } else if (isYoutube(url)) {
          command += ` --sub-langs "${language}" `;
        }
        command += '--convert-subs=srt ';
        if (cookies) {
          command += `--cookies ${cookies} `;
        }
        command += ` "${url}" -o "${outputFolder}/${folder}/"`;

        exec(command, { maxBuffer: 1024 * 2048 }, async (error) => {
          if (error) {
            console.log('>>> Warning Comand error:', error);
            deleteFolder(`${outputFolder}/${folder}`);
            return rej(error);
          }
          let selectedSRT = '';
          try {
            const filesInFolder = fs.readdirSync(`${outputFolder}/${folder}`);
            // console.log('filesInFolder', filesInFolder);
            if (filesInFolder.length > 1) {
              const selected = filesInFolder.find((i) => {
                const file = i.toLowerCase();
                if (
                  file.startsWith('en.srt') ||
                  file.startsWith('.en_us') ||
                  file.startsWith('es.srt') ||
                  file.startsWith('.es_es') ||
                  file.startsWith('.en-us') ||
                  file.startsWith('.es-es') ||
                  file.startsWith('.eng-us') ||
                  file.startsWith('.spa-es') ||
                  file.startsWith('en-us') ||
                  file.startsWith('es-es') ||
                  file.startsWith('en-mx')
                ) {
                  console.log('lang selected', i);
                  return i;
                }
                return null;
              });
              if (selected) {
                selectedSRT = `${folder}/${selected}`;
                subtitles = fs.readFileSync(
                  `${outputFolder}/${selectedSRT}`,
                  'utf8'
                );
              }
            } else if (filesInFolder.length) {
              // subtitles = filesInFolder
              //   .map((file) => fs.readFileSync(`${folder}/${file}`, 'utf8'))
              //   .join('');
              selectedSRT = `${folder}/${filesInFolder[0]}`;
              subtitles = fs.readFileSync(
                `${outputFolder}/${selectedSRT}`,
                'utf8'
              );
            }

            if (subtitles) {
              cleanSubtitles = SRTToText(subtitles);

              await CopyFile({ src: selectedSRT, dest: dest_clean });
              deleteFolder(`${outputFolder}/${folder}`);

              res({
                name,
                srt_file: `media/${dest_clean}`,
                subtitles,
                cleanSubtitles,
                language,
                thumbnail,
              });
            } else if (localLink) {
              deleteFolder(`${outputFolder}/${folder}`);
              GenerateSRT({
                src: localLink,
                dest: dest_clean,
                language: videoLanguage ?? 'en',
                max_words_per_line: 3,
              })
                .then((response) => {
                  subtitles = response.srt;
                  cleanSubtitles = SRTToText(subtitles);
                  res({
                    name,
                    srt_file: response.file,
                    subtitles,
                    cleanSubtitles,
                    language,
                    thumbnail,
                  });
                })
                .catch(() =>
                  rej(
                    `> No Subttles!\n\nCommand: ${command}\n\nFiles in folder:${filesInFolder}\n\n`
                  )
                );
            } else {
              deleteFolder(`${outputFolder}/${folder}`);
              return rej(
                `> No Subttles!\n\nCommand: ${command}\n\nFiles in folder:${filesInFolder}\n\n`
              );
            }
          } catch (err) {
            console.log('err', err);
            deleteFolder(folder);
            return rej(err);
          }
        });
      })
      .catch((e) => {
        // deleteFolder(folder);
        rej(e);
      });
  });
};

export default DownloadSubtitle;
