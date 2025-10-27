import { exec } from 'child_process';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isYoutube from '@repo/helpers/is-youtube-checker';
import isInstagram from '@repo/helpers/is-instagram-checker';
import getFinalURL from '@repo/helpers/get-final-url';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  url: string;
  name: string;
  outputFolder?: string;
  cookies?: string;
  linuxBinary?: string;
};

const DownloadVideo = ({
  url,
  name,
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
  cookies = nodeEnv == 'production'
    ? '/app/netscape-cookies.txt'
    : './netscape-cookies.txt',
  linuxBinary = nodeEnv == 'production' ? 'yt-dlp' : './yt-dlp',
}: Props): Promise<string> => {
  const src_clean = name.replaceAll('media/', '');

  const clean_name = src_clean;
  const file = `${outputFolder}/${clean_name}`;

  let finalULR = url;
  // let finalLanguage = '';

  const promises: Array<Promise<void>> = [];

  if (isInstagram(url)) {
    promises.push(
      new Promise((res, rej) => {
        getFinalURL(url)
          .then((value) => {
            finalULR = value;
            res();
          })
          .catch((e) => rej(e));
      })
    );
  }

  return new Promise((res, rej) => {
    Promise.all(promises).then(() => {
      // Main Command
      let command = `${linuxBinary} "${finalULR}" `;
      if (isYoutube(finalULR)) {
        command += '-f bestvideo[ext=mp4]+bestaudio[ext=m4a]';
        command += '/bestvideo+bestaudio ';
        command += '--no-abort-on-error --no-playlist ';
      }
      command += `--add-header "user-agent:Mozilla/5.0" -vU `;

      if (isTiktok(finalULR)) {
        command += '-S "codec:h264" ';
      }
      if (cookies) {
        command += `--cookies ${cookies} `;
      }
      command += '--merge-output-format mp4 ';
      command += `-o "${file}" `;
      command += '--quiet';

      exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
        if (error) {
          return rej(error);
        }
        return res(`media/${clean_name}`);
      });
    });
  });
};

export default DownloadVideo;
