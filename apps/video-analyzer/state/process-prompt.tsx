/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AddNewAnalysis } from '@/state/video-reducer';
import { VideoAnalysisType } from '@/state/analysis-type';
import CreateNewAnalysis from '@/lib/create-new-analysis';
import GetAnalysisByID from '@/lib/get-analysis-by-id';
import UpdateVideoRelationships from '@/lib/update-video-relationships';
import GetVideoByID from '@/lib/get-video-by-id';
import { VideoType } from '@/state/video-type';
import GenerateAnalysis from '@/lib/generate-analysis';
import CreateNewVideo from '@/lib/create-new-video';
import GetSubtitles from '@/lib/get-subtitles';
import { useRouter } from 'next/navigation';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import { useState } from 'react';
import ScrollToBottom from '@repo/ui/scroll-to-bottom';

type CB = (video: VideoType) => void;

type CheckSummaryStatusProps = {
  video: VideoType;
  CallBack: CB;
  VideoAnalysis: VideoAnalysisType;
};

type BaseProps = {
  video: VideoType;
  prompt: string;
  CallBack: CB;
};

export type ProcessPromptProps = {
  attributes?: any;
  destination_language?: string;
} & BaseProps;

const useProcessPrompt = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const SaveVideoToLocalStorage = (video: VideoType) => {
    const data: Array<VideoType> = JSON.parse(
      GetLocalStorageData('videos') ?? '[]'
    );
    data.push(video);
    const cleanData = data.map((i: VideoType) => {
      return {
        id: i.id,
        attributes: {
          ...i.attributes,
          clean_transcriptions: '',
          transcriptions: '',
          translated_transcriptions: '',
          translated_clean_transcriptions: '',
          podcast_script: '',
          podcast_srt: '',
          logs: '',
        },
        relationships: i.relationships,
      };
    });
    SetLocalStorageData('videos', JSON.stringify(cleanData));
  };

  const CheckSummaryStatus = ({
    video,
    VideoAnalysis,
    CallBack,
  }: CheckSummaryStatusProps) => {
    if (
      VideoAnalysis.attributes.status === 'done' ||
      VideoAnalysis.attributes.status === 'error'
    ) {
      // setIsLoading(false);
      setIsLoading(false);
      // ScrollToBottom();
      return;
    }
    GetAnalysisByID(VideoAnalysis.id)
      .then((rawAnalysis: VideoAnalysisType) => {
        // console.log('raw analysis', rawAnalysis);
        if (
          rawAnalysis.attributes.status === 'done' ||
          rawAnalysis.attributes.status === 'error'
        ) {
          // dispatch({ type: 'update-analysis', rawAnalysis });
          const newAnalysis = video.relationships.analysis.data.map((i) => {
            if (i.id === rawAnalysis.id) {
              return rawAnalysis;
            }
            return i;
          });
          CallBack({
            ...video,
            relationships: {
              ...video.relationships,
              analysis: {
                data: newAnalysis,
              },
            },
          });
          setIsLoading(false);
          return;
        } else {
          setTimeout(
            () =>
              CheckSummaryStatus({
                video,
                VideoAnalysis: rawAnalysis,
                CallBack,
              }),
            3000
          );
        }
      })
      .catch(() =>
        setTimeout(
          () => CheckSummaryStatus({ video, VideoAnalysis, CallBack }),
          3000
        )
      );
  };

  const CreateAnalysis = ({ prompt, video, CallBack }: BaseProps) => {
    CreateNewAnalysis(prompt, video.id)
      .then((rawAnalysis: VideoAnalysisType) => {
        const VideoWithNewAnalysis = AddNewAnalysis(video, rawAnalysis);
        UpdateVideoRelationships(VideoWithNewAnalysis)
          .then(() => {
            GetVideoByID(video.id)
              .then((rawVideo: VideoType) => {
                // dispatch({ type: 'set-data', rawData });
                // setIsLoading(false);
                // setIsLoading(false);
                CallBack(rawVideo);

                GenerateAnalysis(rawAnalysis.id, rawVideo.id)
                  .then(() => {
                    CheckSummaryStatus({
                      video: rawVideo,
                      VideoAnalysis: rawAnalysis,
                      CallBack,
                    });
                  })
                  .catch(() => setIsLoading(false));
              })
              .catch(() => setIsLoading(false));
          })
          .catch(() => setIsLoading(false));
      })
      .catch(() => setIsLoading(false));
  };

  const ProcessPrompt = ({
    video,
    prompt = '',
    attributes,
    destination_language,
    CallBack,
  }: ProcessPromptProps) => {
    setIsLoading(true);
    if (video.id) {
      ScrollToBottom();
      CreateAnalysis({ prompt, video, CallBack });
    } else {
      CreateNewVideo(attributes)
        .then((newVideo: VideoType) => {
          if (prompt) {
            CreateNewAnalysis(prompt, newVideo.id)
              .then((rawAnalysis: VideoAnalysisType) => {
                const VideoWithNewAnalysis = AddNewAnalysis(
                  newVideo,
                  rawAnalysis
                );
                UpdateVideoRelationships(VideoWithNewAnalysis)
                  .then(() => {
                    GetVideoByID(newVideo.id)
                      .then((rawData: VideoType) => {
                        GetSubtitles(rawData.id)
                          .then(() => {
                            SaveVideoToLocalStorage(rawData);
                            router.push(`/videos/${rawData.attributes.uuid}/`);
                          })
                          .catch(() => setIsLoading(false));
                      })
                      .catch(() => setIsLoading(false));
                  })
                  .catch(() => setIsLoading(false));
              })
              .catch(() => setIsLoading(false));
          } else {
            GetSubtitles(newVideo.id)
              .then(() => {
                SaveVideoToLocalStorage(newVideo);
                router.push(`/videos/${newVideo.attributes.uuid}/`);
              })
              .catch(() => setIsLoading(false));
          }
        })
        .catch(() => setIsLoading(false));
    }
  };

  return { exec: ProcessPrompt, isLoading };
};

export default useProcessPrompt;
