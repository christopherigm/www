import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import Post from '@repo/helpers/api-post';
import Patch from '@repo/helpers/api-patch';
import Get from '@repo/helpers/api-get';
import type {
  BackgroundVideoType,
  BackgroundVideoAttributesType,
} from '@/state/background-video-type';
import { DefaultBackgroundVideo } from '@/state/background-video-type';
import Delete from '@repo/helpers/api-delete';

const BaseURL = APIGetBaseURLFromEnv();
const url = `${BaseURL}/v1/backgrounds/`;

export const APICreate = (
  attributes: BackgroundVideoAttributesType
): Promise<BackgroundVideoType> => {
  return new Promise((res, rej) => {
    const { type } = DefaultBackgroundVideo;
    const data = {
      type,
      attributes,
    };
    Post(url, data, true)
      .then((data: BackgroundVideoType) => {
        Post('/download-video-and-loop', {
          id: data.id,
          url: data.attributes.link,
          dest: data.attributes.local_link,
          timeLength: data.attributes.time_length,
          transitionDuration: data.attributes.transition_duration,
        }).catch((e) => console.log(e));
        res(data);
      })
      .catch((e) => rej(e));
  });
};

export const APIUpdate = (
  id: string,
  attributes: BackgroundVideoAttributesType
): Promise<BackgroundVideoType> => {
  return new Promise((res, rej) => {
    const data = {
      ...DefaultBackgroundVideo,
      id,
      attributes,
    };
    Patch(`${url}${id}/`, data, true)
      .then((data: BackgroundVideoType) => res(data))
      .catch((e) => rej(e));
  });
};

export const APIGetByID = (id: string): Promise<BackgroundVideoType> => {
  return new Promise((res, rej) => {
    Get(`${url}${id}/`, true)
      .then((data: BackgroundVideoType) => res(data))
      .catch((e) => rej(e));
  });
};

export const APIGetAll = (): Promise<Array<BackgroundVideoType>> => {
  return new Promise((res, rej) => {
    Get(`${url}?sort=-created&page[offset]=0&page[limit]=1000`, true)
      .then((items: Array<BackgroundVideoType>) => res(items))
      .catch((e) => rej(e));
  });
};

export const APIDelete = (id: string): Promise<void> => {
  return new Promise((res, rej) => {
    APIGetByID(id)
      .then((data) =>
        Delete(`${url}${id}/`)
          .then(() => {
            Post('/delete-media', {
              media: data.attributes.local_link,
            })
              .then(() => res())
              .catch((e) => console.log(e));
          })
          .catch((e) => rej(e))
      )
      .catch((e) => rej(e));
  });
};
