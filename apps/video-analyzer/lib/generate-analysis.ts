import Post from '@repo/helpers/api-post';

const GenerateAnalysis = (
  videoAnalisysID: string,
  videoID: string
): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-analysis/', { videoID, videoAnalisysID })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default GenerateAnalysis;
