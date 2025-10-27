import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';

import Patch from '@repo/helpers/api-patch';
import { type VideoAnalysisType } from '@/state/analysis-type';

const UpdateAnalysisAttributes = (
  analysis: VideoAnalysisType
): Promise<VideoAnalysisType> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/video-analisys/${analysis.id}/`;
    const data = {
      id: analysis.id,
      type: 'VideoAnalisys',
      attributes: analysis.attributes,
    };
    Patch(url, data, true)
      .then((rawAnalysis: VideoAnalysisType) => res(rawAnalysis))
      .catch((e) => rej(e));
  });
};

export default UpdateAnalysisAttributes;
