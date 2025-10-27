import Post from '@repo/helpers/api-post';

const CreatePodcastAudio = (
  id: string,
  speakers: Array<string>
): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-podcast-audio', { id, speakers })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default CreatePodcastAudio;
