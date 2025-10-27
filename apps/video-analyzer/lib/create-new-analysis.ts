import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';

import Post from '@repo/helpers/api-post';
import { type VideoAnalysisType } from '@/state/analysis-type';

const CreateNewAnalysis = (
  prompt: string,
  videoId: string
): Promise<VideoAnalysisType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/video-analisys/`;
    const data = {
      type: 'VideoAnalisys',
      attributes: {
        requested_characteristics: prompt,
        status: 'processing',
      },
      relationships: {
        video: {
          data: {
            type: 'Video',
            id: videoId,
          },
        },
      },
    };
    Post(url, data, true)
      .then((rawAnalysis: VideoAnalysisType) => res(rawAnalysis))
      .catch((e) => rej(e));
  });
};

export default CreateNewAnalysis;
