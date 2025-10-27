import Post from '@repo/helpers/api-post';

const CreateVideoWithTranslatedSubtitles = (
  id: string,
  destination_language: string
): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-video-with-translated-subtitles', {
      id,
      destination_language,
    })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default CreateVideoWithTranslatedSubtitles;
