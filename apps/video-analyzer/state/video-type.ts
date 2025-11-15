import { DefaultVideoAnalysisState } from '@/state/analysis-type';

export const DefaultVideoAttributes = {
  enabled: true,
  order: 0,
  created: '',
  modified: '',
  version: 5,
  description: '',
  href: '',
  full_size: true,
  fit: '',
  background_color: '',
  img_picture: '',
  status: '',
  uuid: '',
  link: '',
  local_link: '',
  local_link_sub: '',
  local_link_translated: '',
  local_link_translated_audio: '',
  local_link_podcast: '',
  local_link_podcast_video: '',
  local_link_podcast_srt: '',
  podcast_diarization: '',
  local_link_podcast_diarization: '',
  podcast_language: '',
  podcast_script: '',
  podcast_srt: '',
  local_link_original_srt: '',
  transcriptions: '',
  clean_transcriptions: '',
  translated_transcriptions: '',
  translated_clean_transcriptions: '',
  language: '',
  requested_captions_language: '',
  requested_subtitles_language: '',
  name: '',
  thumbnail: '',
  worker_node: '',
  started: '',
  ended: '',
  ip_address: '',
  logs: '',
};

export type BaseVideoAttributesType = typeof DefaultVideoAttributes;
export type VideoAttributesType = {
  [Property in keyof BaseVideoAttributesType]?: string | number | boolean;
};

export const DefaultVideo = {
  type: 'Video',
  id: '',
  isLoading: false,
  activeLink: '',
  attributes: DefaultVideoAttributes,
  relationships: {
    user: {},
    analysis: {
      data: [DefaultVideoAnalysisState],
    },
  },
};

export type VideoType = typeof DefaultVideo;
