import { exec } from 'child_process';
import fs from 'fs';
import DeleteMediaFile from './delete-media-file';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  srt_string: string;
  src_video: string;
  dest_video: string;
  aligment?: number;
  marginV?: number;
  font?: string;
  fontSize?: number;
  borderStyle?: number;
  backColour?: string;
  outputFolder?: string;
};

const BurnSRTIntoVideo = ({
  srt_string,
  src_video,
  dest_video,
  aligment = 6,
  marginV = 40,
  font = 'Roboto Bold',
  fontSize = 20,
  borderStyle = 0,
  backColour = 'H70000000',
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_video_clean = src_video.replaceAll('media/', '');
  const dest_video_clean = dest_video.replaceAll('media/', '');

  const src_file = `${outputFolder}/${src_video_clean}`;
  const dest_file = `${outputFolder}/${dest_video_clean}`;

  return new Promise((res, rej) => {
    const SRTFilePath = `${outputFolder}/${dest_video_clean}.srt`;
    fs.writeFileSync(SRTFilePath, srt_string, 'utf-8');

    // https://stackoverflow.com/questions/8672809/use-ffmpeg-to-add-text-subtitles
    // ffmpeg -i infile.mp4 -vf subtitles=subtitles.srt mysubtitledmovie.mp4
    let command = `ffmpeg -y -i "${src_file}" `;
    command += `-vf subtitles="${SRTFilePath}:`;
    command += `force_style='FontName=${font},FontSize=${fontSize},`;
    command += `BorderStyle=${borderStyle},`;
    command += `BackColour=&${backColour},`;
    command += `Alignment=${aligment},MarginV=${marginV}'" `;
    command += `"${dest_file}"`;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        console.log('Error videoSRTCommand:', error);
        return rej(error);
      }
      DeleteMediaFile(`media/${SRTFilePath}`);
      return res(`media/${dest_video_clean}`);
    });
  });
};

export default BurnSRTIntoVideo;
