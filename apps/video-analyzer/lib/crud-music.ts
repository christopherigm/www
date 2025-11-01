import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import Post from '@repo/helpers/api-post';
import Patch from '@repo/helpers/api-patch';
import Get from '@repo/helpers/api-get';
import type {
  BackgroundMusicType,
  BackgroundMusicAttributesType,
} from '@/state/background-music-type';
import { DefaultBackgroundMusic } from '@/state/background-music-type';
import Delete from '@repo/helpers/api-delete';

const BaseURL = APIGetBaseURLFromEnv();
const url = `${BaseURL}/v1/music/`;

export const APICreateNewMusic = (
  attributes: BackgroundMusicAttributesType
): Promise<BackgroundMusicType> => {
  return new Promise((res, rej) => {
    const { type } = DefaultBackgroundMusic;
    const data = {
      type,
      attributes,
    };
    Post(url, data, true)
      .then((data: BackgroundMusicType) => {
        Post('/download-audio-and-loop', {
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

export const APIUpdateMusic = (
  id: string,
  attributes: BackgroundMusicAttributesType
): Promise<BackgroundMusicType> => {
  return new Promise((res, rej) => {
    const data = {
      ...DefaultBackgroundMusic,
      id,
      attributes,
    };
    Patch(`${url}${id}/`, data, true)
      .then((data: BackgroundMusicType) => res(data))
      .catch((e) => rej(e));
  });
};

export const APIGetMusicByID = (id: string): Promise<BackgroundMusicType> => {
  return new Promise((res, rej) => {
    Get(`${url}${id}/`, true)
      .then((data: BackgroundMusicType) => res(data))
      .catch((e) => rej(e));
  });
};

export const APIGetAllMusic = (): Promise<Array<BackgroundMusicType>> => {
  return new Promise((res, rej) => {
    Get(`${url}?sort=-created&page[offset]=0&page[limit]=1000`, true)
      .then((items: Array<BackgroundMusicType>) => res(items))
      .catch((e) => rej(e));
  });
};

export const APIDeleteMusic = (id: string): Promise<void> => {
  return new Promise((res, rej) => {
    APIGetMusicByID(id)
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
