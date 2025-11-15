import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type CaptionObject = {
  ext: 'json3' | 'srt';
  url: string;
};

export type YouTubePayload = {
  id: string;
  title: string;
  thumbnail: string;
  automatic_captions: {
    [key: string]: Array<CaptionObject>;
  };
  subtitles: {
    [key: string]: Array<CaptionObject>;
  };
  channel?: string;
  uploader?: string;
  artist?: string;
};

type Props = {
  url: string;
  linuxBinary?: string;
  cookies?: string;
};

const VideoDetails = ({
  url,
  linuxBinary = nodeEnv == 'production' ? 'yt-dlp' : './yt-dlp',
  cookies = nodeEnv == 'production'
    ? '/app/netscape-cookies.txt'
    : './netscape-cookies.txt',
}: Props): Promise<YouTubePayload> => {
  return new Promise((res, rej) => {
    let command = linuxBinary;
    if (cookies) {
      command += ` --cookies ${cookies} `;
    }
    command += ` --dump-json "${url}" | jq --raw-output`;
    exec(command, { maxBuffer: 1024 * 2048 }, (error, data: string) => {
      if (error || !data) {
        console.log('Error:', error, '> command:', command);
        return rej(error);
      }
      const youtubeData: YouTubePayload = JSON.parse(data);

      return res(youtubeData);
    });
  });
};

export default VideoDetails;
