import { exec } from 'child_process';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type Props = {
  src_video: string;
  src_audio: string;
  dest: string;
  offset: number | string;
  format?: 'wav' | 'mp3' | 'ogg';
  outputFolder?: string;
};

const AddAudioToVideoInTime = ({
  src_video,
  src_audio,
  dest,
  offset = 0,
  format = 'wav',
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
}: Props): Promise<string> => {
  const src_video_clean = src_video.replaceAll('media/', '');
  const src_audio_clean = src_audio.replaceAll('media/', '');
  const dest_clean = dest.replaceAll('media/', '');

  const src_video_file = `${outputFolder}/${src_video_clean}`;
  const src_audio_file = `${outputFolder}/${src_audio_clean}`;
  const dest_file = `${outputFolder}/${dest_clean}`;

  return new Promise((res, rej) => {
    // ffmpeg -i input_video.mp4 -itsoffset 5 -i input_audio.mp3 -map 0:v -map 1:a -c:v copy -c:a aac output.mp4
    let command = `ffmpeg -y -i "${src_video_file}" `;
    command += `-itsoffset "${offset}" -i "${src_audio_file}" `;
    if (format === 'wav') {
      command += '-map 0:v -map 1:a -c:v copy -c:a aac ';
    }
    command += dest_file;
    exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
      if (error) {
        return rej(error);
      }
      return res(`media/${dest_clean}`);
    });
  });
};

export default AddAudioToVideoInTime;
