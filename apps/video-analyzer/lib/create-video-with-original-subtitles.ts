import Post from '@repo/helpers/api-post';

const CreateVideoWithOriginalSubtitles = (id: string): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-video-with-original-subtitles', { id })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default CreateVideoWithOriginalSubtitles;
