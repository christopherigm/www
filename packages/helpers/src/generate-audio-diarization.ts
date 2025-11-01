import fs from 'fs';
import Post from '@repo/helpers/api-post';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

export type Diarization = {
  speaker: number;
  start: number;
  end: number;
};

type Props = {
  name: string;
  outputFolder?: string;
};

type SendRequestProps = {
  callBack: (srt: string) => void;
} & Props;

type ServiceResponse = {
  status: string;
  path?: string;
};

const SendRequest = ({
  name,
  outputFolder = 'media',
  callBack,
}: SendRequestProps) => {
  const url = 'http://192.168.0.28:8082/';
  const data = {
    name,
    output_dir: outputFolder,
    production: nodeEnv == 'production',
  };
  Post(url, data)
    .then(async (response: ServiceResponse) => {
      if (response.status === 'busy') {
        console.log('Server busy, retriying in 5 seconds, Video #');
        return setTimeout(
          () =>
            SendRequest({
              name,
              outputFolder,
              callBack,
            }),
          5000
        );
      }
      callBack(response.path ?? name);
    })
    .catch((e) => {
      console.log('>> Post GenerateAudioDiarization error:', e);
      callBack('error');
    });
};

type Response = {
  file: string;
  diarization: string;
};

const GenerateAudioDiarization = ({
  name,
  outputFolder = 'media',
}: Props): Promise<Response> => {
  return new Promise((res) => {
    SendRequest({
      name,
      outputFolder,
      callBack: (file: string) => {
        const rootFolder =
          nodeEnv == 'production' ? '/app/media' : 'public/media';
        const rawDiarization = fs.readFileSync(
          `${rootFolder}/${file}`,
          'utf-8'
        );
        const diarization: Array<Diarization> = JSON.parse(rawDiarization);
        res({
          file: `media/${file}`,
          diarization: JSON.stringify(diarization),
        });
      },
    });
  });
};

export default GenerateAudioDiarization;
