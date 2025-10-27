import Post from '@repo/helpers/api-post';

const GetSubtitles = (id: string): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/get-subtitles', { id })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default GetSubtitles;
