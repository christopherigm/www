import fs from 'fs';
import Post from '@repo/helpers/api-post';
import CopyFile from './copy-file';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type BaseProps = {
  src: string;
  language: string;
  max_words_per_line?: number;
  model?: string;
  output_dir?: string;
};

type SendRequestProps = {
  callBack: (srt: string) => void;
} & BaseProps;

const SendRequest = ({
  src,
  language = 'en',
  max_words_per_line,
  model = 'base',
  callBack,
}: SendRequestProps) => {
  const url = 'http://192.168.0.28:8081/';
  const data = {
    name: src,
    language,
    max_words_per_line,
    model,
    production: nodeEnv == 'production',
  };
  // console.log('>> SendRequest for TTS', data);
  Post(url, data)
    .then(async (response: { status: string }) => {
      if (response.status === 'busy') {
        console.log('Server busy, retriying in 5 seconds, Video #');
        return setTimeout(
          () =>
            SendRequest({
              src,
              language,
              max_words_per_line,
              model,
              callBack,
            }),
          5000
        );
      }
      console.log('Response', response);
      const srt = src.replace('.wav', '.srt').replace('.mp4', '.srt');
      callBack(srt);
    })
    .catch((e) => {
      console.log('>> Post voice AI error:', e);
      callBack('error');
    });
};

type Props = {
  dest: string;
  outputFolder?: string;
} & BaseProps;

type Response = {
  file: string;
  srt: string;
};

const GenerateSRT = ({
  src,
  dest,
  language = 'en',
  outputFolder = nodeEnv == 'production' ? '/app/media' : 'public/media',
  max_words_per_line,
  model = 'base',
}: Props): Promise<Response> => {
  return new Promise((res, rej) => {
    const src_clean = src; //.replaceAll('media/', '');
    const dest_clean = dest.replaceAll('media/', '');

    const dest_file = `${outputFolder}/${dest_clean}`;

    SendRequest({
      src: src_clean,
      language,
      max_words_per_line,
      model,
      callBack: (file: string) => {
        if (file === 'error') {
          return rej('error');
        }
        CopyFile({
          src: file,
          dest: dest_clean,
        })
          .then(() => {
            const srt = fs.readFileSync(dest_file, 'utf-8');
            // console.log('>> CopyFile done');
            res({ file: `media/${dest_clean}`, srt });
          })
          .catch((e) => rej(e));
      },
    });
  });
};

export default GenerateSRT;
