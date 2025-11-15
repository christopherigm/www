export const DefaultBackgroundMusicAttributes = {
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

export type BaseBackgroundMusicAttributesType =
  typeof DefaultBackgroundMusicAttributes;
export type BackgroundMusicAttributesType = {
  [Property in keyof BaseBackgroundMusicAttributesType]?:
    | string
    | number
    | boolean;
};

export const DefaultBackgroundMusic = {
  type: 'Music',
  id: '',
  attributes: DefaultBackgroundMusicAttributes,
};

export type BackgroundMusicType = typeof DefaultBackgroundMusic;
