/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@repo/helpers/api/index';
import RebuildData from '@repo/helpers/json-api-rebuild';
import { GetFirstErrorMessage } from '@repo/helpers/api-error-handler';
import APIGetJWTFromLocalStorage from '@repo/helpers/api-get-jwt-from-local-storage';

const Get = (url: string, jsonapi: boolean = false): Promise<any> => {
  return new Promise((res, rej) => {
    const jwt = APIGetJWTFromLocalStorage();
    API.Get({
      url,
      ...(jwt &&
        jwt.access && {
          jwt: jwt.access,
        }),
      jsonapi,
    })
      .then((response: any) => {
        if (response.errors && response.errors.length) {
          return rej(GetFirstErrorMessage(response.errors));
        }
        const data =
          url.search('include') > -1 ? RebuildData(response) : response;
        res(jsonapi ? data.data : data);
      })
      .catch((errors) => {
        if (errors && errors.length) {
          return rej(GetFirstErrorMessage(errors));
        }
        res(null);
      });
  });
};

export default Get;
