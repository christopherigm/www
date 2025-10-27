import API from '@repo/helpers/api/index';
import { GetFirstErrorMessage } from '@repo/helpers/api-error-handler';
import APIGetJWTFromLocalStorage from '@repo/helpers/api-get-jwt-from-local-storage';

const Delete = (url: string, jsonapi: boolean = false): Promise<void> => {
  return new Promise((res, rej) => {
    const jwt = APIGetJWTFromLocalStorage();
    API.Delete({
      url,
      ...(jwt &&
        jwt.access && {
          jwt: jwt.access,
        }),
      jsonapi,
    })
      .then(() => res())
      .catch((errors) => {
        if (errors && errors.length) {
          return rej(GetFirstErrorMessage(errors));
        }
        rej(errors);
      });
  });
};

export default Delete;
