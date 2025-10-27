import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';

import Get from '@repo/helpers/api-get';
import { type VideoType } from '@/state/video-type';

const GetVideoByID = (id: string): Promise<VideoType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/videos/${id}/?include=analysis`;
    Get(url, true)
      .then((data: VideoType) => res(data))
      .catch((e) => rej(e));
  });
};

export default GetVideoByID;
