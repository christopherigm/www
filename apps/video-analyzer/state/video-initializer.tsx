'use client';

import { useEffect } from 'react';
import { useVideoContext } from '@/state/video-reducer';
import { VideoType } from '@/state/video-type';
import GetVideoByID from '@/lib/get-video-by-id';
import { VideoAnalysisType } from './analysis-type';
import GenerateAnalysis from '@/lib/generate-analysis';
import GetAnalysisByID from '@/lib/get-analysis-by-id';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import isYoutube from '@repo/helpers/is-youtube-checker';

export const GetActiveLink = (video: VideoType): string => {
  const activeLink =
    video.attributes.link && isYoutube(video.attributes.link)
      ? video.attributes.link
      : video.attributes.local_link
        ? video.attributes.local_link
        : '';
  return activeLink;
};

type Props = {
  ssr_video: VideoType;
};

const VideoInitializer = ({ ssr_video }: Props) => {
  const { dispatch } = useVideoContext();

  const checkTranscriptionsStatus = (video: VideoType) => {
    const status = video.attributes.status;
    if (!video.id || status === 'done' || status === 'error') {
      if (status === 'done' && video.attributes.transcriptions) {
        video.relationships.analysis.data.map((i: VideoAnalysisType) => {
          if (
            i.id &&
            i.attributes.worker_node === '' &&
            i.attributes.status === 'processing'
          ) {
            GenerateAnalysisWhenVideoDone(i.id, ssr_video.id);
          }
        });
      }
      dispatch({ type: 'loading', isLoading: false });
      return;
    }
    if (video.attributes.transcriptions) {
      return;
    }
    GetVideoByID(video.id)
      .then((rawData: VideoType) => {
        if (
          rawData.attributes.status === 'done' ||
          rawData.attributes.status === 'error'
        ) {
          rawData.activeLink = GetActiveLink(rawData);
          dispatch({ type: 'patch-data', rawData });
        }
        SaveVideoToLocalStorage(rawData);
        setTimeout(() => checkTranscriptionsStatus(rawData), 3000);
      })
      .catch(() => setTimeout(() => checkTranscriptionsStatus(video), 3000));
  };

  const CheckSummaryStatus = (VideoAnalysis: VideoAnalysisType) => {
    const status = VideoAnalysis.attributes.status;
    if (status === 'done' || status === 'error') {
      return;
    }
    GetAnalysisByID(VideoAnalysis.id)
      .then((rawAnalysis: VideoAnalysisType) => {
        dispatch({ type: 'update-analysis', rawAnalysis });
        if (rawAnalysis.attributes.status === 'processing') {
          setTimeout(() => CheckSummaryStatus(rawAnalysis), 3000);
        }
      })
      .catch(() => setTimeout(() => CheckSummaryStatus(VideoAnalysis), 3000));
  };

  const GenerateAnalysisWhenVideoDone = (
    videoAnalisysID: string,
    videoID: string
  ) => {
    GenerateAnalysis(videoAnalisysID, videoID)
      .then(() => {
        GetAnalysisByID(videoAnalisysID)
          .then((rawAnalysis: VideoAnalysisType) => {
            dispatch({ type: 'update-analysis', rawAnalysis });
            if (rawAnalysis.attributes.status === 'processing') {
              setTimeout(() => CheckSummaryStatus(rawAnalysis), 3000);
            }
          })
          .catch((e) => {
            console.log('Error:', e);
          });
      })
      .catch((e) => console.log('UpdateVideoRelationships Error:', e));
  };

  const SaveVideoToLocalStorage = (video: VideoType) => {
    const data: Array<VideoType> = JSON.parse(
      GetLocalStorageData('videos') ?? '[]'
    );
    const cleanData = data.map((i: VideoType) => {
      if (i.id === video.id) {
        return {
          id: i.id,
          attributes: {
            ...i.attributes,
            ...video.attributes,
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
      }
      return i;
    });
    SetLocalStorageData('videos', JSON.stringify(cleanData));
  };

  useEffect(() => {
    const video = {
      ...ssr_video,
      isLoading: false,
      activeLink: GetActiveLink(ssr_video),
    };
    dispatch({ type: 'set-data', rawData: video });
    SaveVideoToLocalStorage(video);
    checkTranscriptionsStatus(video);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssr_video]);

  return <></>;
};

export default VideoInitializer;
