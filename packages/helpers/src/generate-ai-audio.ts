import Post from '@repo/helpers/api-post';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

type BaseProps = {
  dest: string;
  text: string;
  speakers: Array<string>;
  cfg_scale?: number;
};

type SendRequestProps = {
  callBack: (srt: string) => void;
} & BaseProps;

const SendRequest = ({
  dest,
  text = 'Hello world',
  speakers,
  cfg_scale = 1.8,
  callBack,
}: SendRequestProps) => {
  const url = 'http://192.168.0.28:8080/';
  const data = {
    name: dest,
    output_dir: 'media',
    device: 'cuda',
    text,
    speaker_names: speakers.join(', '),
    cfg_scale,
    production: nodeEnv == 'production',
  };
  Post(url, data)
    .then(async (response: { status: string }) => {
      if (response.status === 'busy') {
        console.log('Server busy, retriying in 5 seconds, Video #');
        return setTimeout(
          () =>
            SendRequest({
              dest,
              text,
              speakers,
              cfg_scale,
              callBack,
            }),
          5000
        );
      }
      // console.log('Response', response);
      const generatedWav = `${dest}_generated.wav`;
      callBack(generatedWav);
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

const GenerateAIAudio = ({
  dest,
  text = 'Hello world',
  speakers = ['Chris'],
  cfg_scale = 1.8,
}: Props): Promise<string> => {
  return new Promise((res, rej) => {
    const dest_clean = dest.replaceAll('media/', '');

    SendRequest({
      dest: dest_clean,
      text,
      speakers,
      cfg_scale,
      callBack: (file: string) => {
        if (file === 'error') {
          return rej('error');
        }
        res(`media/${file}`);
      },
    });
  });
};

export default GenerateAIAudio;
