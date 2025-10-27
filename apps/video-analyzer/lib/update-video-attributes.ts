import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';

import Patch from '@repo/helpers/api-patch';
import { type VideoType } from '@/state/video-type';

const UpdateVideoAttributes = (video: VideoType): Promise<VideoType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/videos/${video.id}/`;
    const data = {
      id: video.id,
      type: 'Video',
      attributes: video.attributes,
    };
    Patch(url, data, true)
      .then((rawVideo: VideoType) => res(rawVideo))
      .catch((e) => rej(e));
  });
};

export default UpdateVideoAttributes;
