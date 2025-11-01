export const DefaultBackgroundVideoAttributes = {
  enabled: true,
  order: 0,
  created: '',
  modified: '',
  version: 1,
  status: '',
  uuid: '',
  link: '',
  local_link: '',
  time_length: 60,
  fps: 30,
  transition_duration: 0,
  name: '',
  thumbnail: '',
  author: '',
  logs: '',
};

export type BaseBackgroundVideoAttributesType =
  typeof DefaultBackgroundVideoAttributes;
export type BackgroundVideoAttributesType = {
  [Property in keyof BaseBackgroundVideoAttributesType]?:
    | string
    | number
    | boolean;
};

export const DefaultBackgroundVideo = {
  type: 'Background',
  id: '',
  attributes: DefaultBackgroundVideoAttributes,
};

export type BackgroundVideoType = typeof DefaultBackgroundVideo;
