'use client';

import { useState } from 'react';
import GetVideoByID from '@/lib/get-video-by-id';
import { VideoType } from '@/state/video-type';
import CreateVideoWithTranslatedSubtitles from '@/lib/create-video-with-translated-subtitles';
import CreateVideoWithOriginalSubtitles from '@/lib/create-video-with-original-subtitles';
import CreateVideoWithTranslatedAudio from '@/lib/create-video-with-translated-audio';

export type LinkType =
  | 'link'
  | 'local_link'
  | 'local_link_sub'
  | 'local_link_translated'
  | 'local_link_translated_audio'
  | 'local_link_podcast'
  | 'local_link_podcast_video';

type BaseProps = {
  video: VideoType;
  type: LinkType;
  doneCallBack: (link: string) => void;
};

type ProcessVideoActionProps = {
  destination_language?: string;
  progressCallBack: (value: string) => void;
} & BaseProps;

const useProcessVideoAction = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requestCompleted = (link: string): boolean => {
    return link !== null && link !== '' && link !== 'processing';
  };

  const CheckStatus = ({ video, type, doneCallBack }: BaseProps) => {
    if (requestCompleted(video.attributes[type])) {
      return setIsLoading(false);
    }
    GetVideoByID(video.id)
      .then((rawData: VideoType) => {
        if (requestCompleted(rawData.attributes[type])) {
          rawData.activeLink = rawData.attributes[type];
          setIsLoading(false);
          return doneCallBack(rawData.attributes[type] ?? '');
        } else {
          setTimeout(
            () => CheckStatus({ video: rawData, type, doneCallBack }),
            3000
          );
        }
      })
      .catch(() =>
        setTimeout(() => CheckStatus({ video, type, doneCallBack }), 3000)
      );
  };

  const ProcessVideoAction = ({
    video,
    type,
    destination_language = 'Spanish',
    doneCallBack,
    progressCallBack,
  }: ProcessVideoActionProps) => {
    setIsLoading(true);
    let promise: Promise<void> | null = null;
    switch (type) {
      case 'local_link':
        break;
      case 'local_link_sub':
        promise = CreateVideoWithOriginalSubtitles(video.id);
        break;
      case 'local_link_translated':
        promise = CreateVideoWithTranslatedSubtitles(
          video.id,
          destination_language
        );
        break;
      case 'local_link_translated_audio':
        promise = CreateVideoWithTranslatedAudio(
          video.id,
          destination_language
        );
        break;
    }
    if (promise) {
      promise
        .then(() => {
          video.attributes[type] = 'processing';
          progressCallBack('processing');
          CheckStatus({ video, type, doneCallBack });
        })
        .catch((error) => {
          setIsLoading(false);
          console.log('>> CreateVideoWithOriginalSubtitles error:', error);
        });
    }
  };

  return {
    isLoading,
    exec: ProcessVideoAction,
  };
};

export default useProcessVideoAction;
