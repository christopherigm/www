import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import Post from '@repo/helpers/api-post';
import type { VideoType } from '@/state/video-type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CreateNewVideo = (dataAttributes: any): Promise<VideoType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/videos/`;
    const data = {
      type: 'Video',
      attributes: {
        ...dataAttributes,
        status: 'processing',
      },
    };
    Post(url, data, true)
      .then((rawVideo: VideoType) => res(rawVideo))
      .catch((e) => rej(e));
  });
};

export default CreateNewVideo;
