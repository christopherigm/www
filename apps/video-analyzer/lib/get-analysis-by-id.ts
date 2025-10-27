import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';

import Get from '@repo/helpers/api-get';
import { type VideoAnalysisType } from '@/state/analysis-type';

const GetAnalysisByID = (id: string): Promise<VideoAnalysisType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/video-analisys/${id}/`;
    Get(url, true)
      .then((update: VideoAnalysisType) => res(update))
      .catch((e) => rej(e));
  });
};

export default GetAnalysisByID;
