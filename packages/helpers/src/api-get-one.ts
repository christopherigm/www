/* eslint-disable @typescript-eslint/no-explicit-any */
import API from '@repo/helpers/api/index';
import RebuildData from '@repo/helpers/json-api-rebuild';
import { GetFirstErrorMessage } from '@repo/helpers/api-error-handler';

import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import APIGetJWTFromLocalStorage from '@repo/helpers/api-get-jwt-from-local-storage';

const GetOne = (url: string, jsonapi: boolean = false): Promise<any> => {
  return new Promise((res, rej) => {
    const jwt = APIGetJWTFromLocalStorage();
    // const BaseURL = APIGetBaseURLFromEnv();
    // if (!BaseURL || BaseURL === '') {
    //   return rej({
    //     message: 'No URL base',
    //     code: '',
    //     status: 0,
    //   });
    // }
    // const URL = externalCall ? url : `${!localCall ? this.URLBase : ''}/${url}`;
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
        res(jsonapi ? data : data.data);
      })
      .catch((errors) => {
        if (errors && errors.length) {
          return rej(GetFirstErrorMessage(errors));
        }
        rej(errors);
      });
  });
};

export default GetOne;
