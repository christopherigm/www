import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';

import Patch from '@repo/helpers/api-patch';
import type { VideoAttributesType, VideoType } from '@/state/video-type';

type Props = {
  id: string;
  attributes: VideoAttributesType;
};

const UpdateVideoAttributes = ({
  id,
  attributes,
}: Props): Promise<VideoType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/videos/${id}/`;
    const data = {
      id: id,
      type: 'Video',
      attributes: attributes,
    };
    Patch(url, data, true)
      .then((rawVideo: VideoType) => res(rawVideo))
      .catch((e) => rej(e));
  });
};

export default UpdateVideoAttributes;
