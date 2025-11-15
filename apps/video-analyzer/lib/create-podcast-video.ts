import Post from '@repo/helpers/api-post';

const CreatePodcastVideo = (
  id: string,
  videoBackground: string,
  videoMusic: string,
  musicVolume: number
): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-podcast-video', {
      id,
      videoBackground,
      videoMusic,
      musicVolume,
    })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default CreatePodcastVideo;
