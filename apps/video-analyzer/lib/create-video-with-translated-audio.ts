import Post from '@repo/helpers/api-post';

const CreateVideoWithTranslatedAudio = (
  id: string,
  language: string
): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-video-with-translated-audio', {
      id,
      language,
    })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default CreateVideoWithTranslatedAudio;
