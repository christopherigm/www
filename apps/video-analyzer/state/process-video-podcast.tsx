'use client';

import { useState } from 'react';
import GetVideoByID from '@/lib/get-video-by-id';
import { VideoType } from '@/state/video-type';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import CreatePodcastScript from '@/lib/create-podcast-script';
import CreatePodcastAudio from '@/lib/create-podcast-audio';
import CreatePodcastVideo from '@/lib/create-podcast-video';

export type LinkType =
  | 'podcast_script'
  | 'local_link_podcast'
  | 'local_link_podcast_video';

type UpdatePodcastScriptProps = {
  video: VideoType;
  doneCallBack: () => void;
};

type BaseProps = {
  video: VideoType;
  type: LinkType;
  speakers?: Array<string>;
  doneCallBack: (link: string) => void;
};

type ProcessPodcastProps = {
  language?: string;
  codeLanguage?: string;
  mood?: string;
  name?: string;
  instrucctions?: string;
  length?: string;
  progressCallBack: (value: string) => void;
} & BaseProps;

type ProcessPodcastVideoProps = {
  videoBackground?: string;
} & BaseProps;

const useProcessPodcast = () => {
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

  const ProcessPodcastScript = ({
    video,
    type,
    language = 'English',
    codeLanguage = 'en',
    speakers = [],
    mood = '',
    name = '',
    instrucctions = '',
    length = 'medium',
    doneCallBack,
    progressCallBack,
  }: ProcessPodcastProps) => {
    setIsLoading(true);
    CreatePodcastScript(
      video.id,
      language,
      codeLanguage,
      speakers,
      mood,
      name,
      instrucctions,
      length
    )
      .then(() => {
        video.attributes.podcast_script = 'processing';
        progressCallBack('processing');
        CheckStatus({ video, type, doneCallBack });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('>> ProcessPodcastScript error:', error);
      });
  };

  const ProcessPodcastAudio = ({
    video,
    type,
    speakers = [],
    doneCallBack,
    progressCallBack,
  }: ProcessPodcastProps) => {
    setIsLoading(true);
    CreatePodcastAudio(video.id, speakers)
      .then(() => {
        video.attributes.local_link_podcast = 'processing';
        progressCallBack('processing');
        CheckStatus({ video, type, doneCallBack });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('>> CreatePodcastAudio error:', error);
      });
  };

  const ProcessPodcastVideo = ({
    video,
    type,
    videoBackground = 'car',
    doneCallBack,
  }: ProcessPodcastVideoProps) => {
    setIsLoading(true);
    CreatePodcastVideo(video.id, videoBackground)
      .then(() => {
        video.attributes.local_link_podcast_video = 'processing';
        CheckStatus({ video, type, doneCallBack });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('>> CreatePodcastAudio error:', error);
      });
  };

  const UpdatePodcastScript = ({
    video,
    doneCallBack,
  }: UpdatePodcastScriptProps) => {
    setIsLoading(true);
    UpdateVideoAttributes(video)
      .then(() => {
        setIsLoading(false);
        doneCallBack();
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('>> video.save() error:', error);
      });
  };

  return {
    isLoading,
    script: ProcessPodcastScript,
    updateScript: UpdatePodcastScript,
    audio: ProcessPodcastAudio,
    video: ProcessPodcastVideo,
  };
};

export default useProcessPodcast;
