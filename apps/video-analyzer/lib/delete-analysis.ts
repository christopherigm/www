import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import Delete from '@repo/helpers/api-delete';

const DeleteAnalysis = (videoAnalisysID: string): Promise<void> => {
  return new Promise((res, rej) => {
    const BaseURL = APIGetBaseURLFromEnv();
    const url = `${BaseURL}/v1/video-analisys/${videoAnalisysID}/`;
    Delete(url, true)
      .then(() => res())
      .catch((e) => rej(e));
  });
};

export default DeleteAnalysis;
