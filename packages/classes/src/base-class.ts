import { Signal, signal } from '@preact-signals/safe-react';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import RebuildData from '@repo/helpers/json-api-rebuild';
import GetEnvVariables from '@repo/helpers/get-env-variables';
import removeImagesForAPICall from '@repo/helpers/remove-images-for-api-call';
import { GetFirstErrorMessage } from '@repo/helpers/api-error-handler';
import type { JWTPayload } from '@repo/interfaces/jwt-interface';
import API from '@repo/helpers/api/index';
import type { GenericImageProps } from '@repo/ui/generic-image/generic-image';

const UtilsAPI = API;

export default abstract class BaseAPIClass {
  abstract type: string;
  abstract endpoint: string;
  abstract attributes: any;
  abstract relationships: any;
  protected redisEndpointKey?: any;
  private _id: Signal<number> = signal(0);
  private _URLBase: Signal<string> = signal('');
  private _URLParameters: Signal<string> = signal('');
  private _jwt: Signal<JWTPayload> = signal({
    exp: 0,
    iat: 0,
    jti: '',
    token_type: '',
    user_id: 0,
    access: '',
    refresh: '',
  });
  private _isLoading: Signal<boolean> = signal(false);

  constructor(URLBase?: string, jwt?: JWTPayload) {
    const env = GetEnvVariables();
    if (URLBase) {
      this.URLBase = URLBase;
    } else if (env.URLBase) {
      this.URLBase = env.URLBase;
    } else {
      const system: any = JSON.parse(GetLocalStorageData('System') || '{}');
      this.URLBase = system.URLBase || this.URLBase;
    }
    if (jwt) {
      this.jwt = jwt;
    } else {
      const JWT: JWTPayload = JSON.parse(GetLocalStorageData('jwt') || '{}');
      this.jwt = JWT.access ? JWT : this.jwt;
    }
  }

  public setAccess(): void {
    if (!this.jwt.access) {
      const jwt: JWTPayload = JSON.parse(GetLocalStorageData('jwt') || '{}');
      this.jwt = jwt.access ? jwt : this.jwt;
    }
    if (!this.URLBase) {
      const system: any = JSON.parse(GetLocalStorageData('System') || '{}');
      this.URLBase = system.URLBase || this.URLBase;
    }
  }

  public Get(
    url: string,
    localCall: boolean = false,
    externalCall: boolean = false
  ): Promise<any> {
    return new Promise((res, rej) => {
      this.setAccess();
      if (
        (!this.URLBase || this.URLBase === '') &&
        !localCall &&
        !externalCall
      ) {
        return rej({
          message: 'No URL base',
          code: '',
          status: 0,
        });
      }
      const URL = externalCall
        ? url
        : `${!localCall ? this.URLBase : ''}/${url}`;
      UtilsAPI.Get({
        url: URL,
        ...(this.jwt.access &&
          !externalCall && {
            jwt: this.jwt.access,
          }),
        jsonapi: !externalCall,
      })
        .then((response: any) => {
          if (response.errors && response.errors.length) {
            return rej(GetFirstErrorMessage(response.errors));
          }
          const data =
            url.search('include') > -1 ? RebuildData(response) : response;
          res(externalCall ? data : data.data);
        })
        .catch((errors) => {
          if (errors && errors.length) {
            return rej(GetFirstErrorMessage(errors));
          }
          rej(errors);
        });
    });
  }

  public Post(
    url: string,
    data: any,
    localCall: boolean = false
  ): Promise<any> {
    return new Promise((res, rej) => {
      this.setAccess();
      if ((!this.URLBase || this.URLBase === '') && !localCall) {
        return rej({
          message: 'No URL base',
          code: '',
          status: 0,
        });
      }
      const URL = `${!localCall ? this.URLBase : ''}/${url}`;
      UtilsAPI.Post({
        url: URL,
        ...(this.jwt.access && {
          jwt: this.jwt.access,
        }),
        data,
      })
        .then((response: any) => {
          if (response.errors && response.errors.length) {
            return rej(GetFirstErrorMessage(response.errors));
          }
          res(response.data);
        })
        .catch((errors) => {
          if (errors && errors.length) {
            return rej(GetFirstErrorMessage(errors));
          }
          rej(errors);
        });
    });
  }

  public Patch(
    url: string,
    data: any,
    localCall: boolean = false
  ): Promise<any> {
    return new Promise((res, rej) => {
      this.setAccess();
      if ((!this.URLBase || this.URLBase === '') && !localCall) {
        return rej({
          message: 'No URL base',
          code: '',
          status: 0,
        });
      }
      const URL = `${!localCall ? this.URLBase : ''}/${url}`;
      UtilsAPI.Patch({
        url: URL,
        ...(this.jwt.access && {
          jwt: this.jwt.access,
        }),
        data,
      })
        .then((response: any) => {
          if (response.errors && response.errors.length) {
            return rej(GetFirstErrorMessage(response.errors));
          }
          res(response.data);
        })
        .catch((errors) => {
          if (errors && errors.length) {
            return rej(GetFirstErrorMessage(errors));
          }
          rej(errors);
        });
    });
  }

  public Delete(url: string, localCall: boolean = false): Promise<void> {
    return new Promise((res, rej) => {
      this.setAccess();
      if ((!this.URLBase || this.URLBase === '') && !localCall) {
        return rej({
          message: 'No URL base',
          code: '',
          status: 0,
        });
      }
      // if (!this.jwt.access) {
      //   return rej({
      //     message: 'No access',
      //     code: '',
      //     status: 0,
      //   });
      // }
      const URL = `${!localCall ? this.URLBase : ''}/${url}`;
      UtilsAPI.Delete({
        url: URL,
        jwt: this.jwt.access,
      })
        .then(() => res())
        .catch((errors) => {
          if (errors && errors.length) {
            return rej(GetFirstErrorMessage(errors));
          }
          rej(errors);
        });
    });
  }

  public setURLParametersForWholeObject(): void {
    this.URLParameters = '';
  }

  public setURLParametersForMinimumObject(): void {
    this.URLParameters = '';
  }

  public getRawItemsFromAPI(
    pageSize: number = 1000,
    pageNumber: number = 1
  ): Promise<Array<any>> {
    return new Promise((res, rej) => {
      let url = this.endpoint;
      if (this.URLParameters) {
        url += `?${this.URLParameters}`;
        url += `&page[size]=${pageSize}`;
        url += `&page[number]=${pageNumber}`;
      } else {
        url += `?page[size]=${pageSize}`;
        url += `&page[number]=${pageNumber}`;
      }
      this.Get(url)
        .then((response: any) => res(response))
        .catch((e) => rej(e));
    });
  }

  public getDropDownItem(data?: any): GenericImageProps {
    const item = data ?? this.getPlainObject();
    const dropDownItem: GenericImageProps = {
      id: Number(item.id) ?? 0,
      ...(item.attributes.img_logo && {
        img_picture: item.attributes.img_logo,
      }),
      ...(item.attributes.img_picture && {
        img_picture: item.attributes.img_picture,
      }),
      ...(item.attributes.name && {
        name: item.attributes.name,
      }),
      ...(item.attributes.fit && {
        fit: item.attributes.fit,
      }),
      ...(item.attributes.background_color && {
        background_color: item.attributes.background_color,
      }),
      rawItem: item,
    };
    return dropDownItem;
  }

  public getDropDownItems(
    pageSize: number = 1000,
    pageNumber: number = 1
  ): Promise<Array<GenericImageProps>> {
    return new Promise((res, rej) => {
      this.getRawItemsFromAPI(pageSize, pageNumber)
        .then((items: Array<any>) => {
          const newOptions: Array<GenericImageProps> = [];
          items.map((i: any) => {
            if (i.attributes) {
              newOptions.push(this.getDropDownItem(i));
            }
          });
          res(newOptions);
        })
        .catch((e) => rej(e));
    });
  }

  public saveAndGetDropDownItem(rawData: any): Promise<GenericImageProps> {
    return new Promise((res, rej) => {
      this.save(rawData)
        .then(() => res(this.getDropDownItem()))
        .catch((e) => rej(e));
    });
  }

  public saveAndGetDropDownItems(
    rawData: any
  ): Promise<Array<GenericImageProps>> {
    return new Promise((res, rej) => {
      this.save(rawData)
        .then(() => res(this.getDropDownItems()))
        .catch((e) => rej(e));
    });
  }

  public setItemByIDFromAPI(): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.id) {
        return rej({
          message: 'no-id',
          code: '',
          status: 0,
        });
      }
      let url = `${this.endpoint}${this.id}/`;
      if (this.URLParameters) {
        url += `?${this.URLParameters}`;
      }
      this.Get(url)
        .then((response: any) => {
          this.setDataFromPlainObject(response);
          this.URLParameters = '';
          res();
        })
        .catch((e) => rej(e));
    });
  }

  public getPlainAttributes() {
    return (this.attributes && this.attributes.getPlainAttributes()) || {};
  }

  public getPlainRelationships() {
    return (
      (this.relationships && this.relationships.getPlainRelationships()) || {}
    );
  }

  public setDataFromPlainObject(object: any) {
    this.id = Number(object.id ?? this.id);
    if (this.attributes) {
      this.attributes.setAttributesFromPlainObject(object);
    }
    if (this.relationships) {
      this.relationships.setRelationshipsFromPlainObject(object);
    }
  }

  public getMinimumPlainObject() {
    return {
      ...(this.id && { id: Number(this.id) }),
      type: this.type,
    };
  }

  public getPlainObject() {
    const attributes = this.getPlainAttributes();
    const relationships = this.getPlainRelationships();
    return {
      ...(this.id && { id: Number(this.id) }),
      type: this.type,
      ...(attributes && {
        attributes,
      }),
      ...(relationships && {
        relationships,
      }),
    };
  }

  public saveLocalStorage() {
    const data = this.getPlainObject();
    if (data.attributes.password) {
      delete data.attributes.password;
    }
    SetLocalStorageData(this.type, JSON.stringify(data));
  }

  public deleteLocalStorage() {
    SetLocalStorageData(this.type, '{}');
  }

  public setDataFromLocalStorage() {
    let cached: any = GetLocalStorageData(this.type);
    if (cached) {
      cached = JSON.parse(cached);
      this.setDataFromPlainObject(cached);
    }
  }

  public setItemFromAPI(): Promise<void> {
    return new Promise((res, rej) => {
      const url = `${this.endpoint}${this.id}`;
      this.Get(url)
        .then((response: any) => {
          this.setDataFromPlainObject(response);
          res();
        })
        .catch((e) => rej(e));
    });
  }

  public updateRedisResource(): Promise<void> {
    return new Promise((res, rej) => {
      this.setURLParametersForWholeObject();
      this.setItemByIDFromAPI()
        .then(() => {
          const url = 'api/update-redis-resource';
          const key = this.redisKey;
          const data = this.getPlainObject();
          this.Post(
            url,
            {
              key,
              data,
            },
            true
          )
            .then(() => res())
            .catch((errors) => rej(errors));
        })
        .catch((errors) => rej(errors));
    });
  }

  public updateRedisItem(): Promise<void> {
    return new Promise((res, rej) => {
      const url = `api/update-redis-${this.redisEndpointKey}`;
      const data = { id: this.id };
      this.Post(url, data, true)
        .then(() => res())
        .catch((e) => rej(e));
    });
  }

  public save(rawData?: any, update: boolean = true): Promise<any> {
    return new Promise((res, rej) => {
      if (rawData) {
        this.setDataFromPlainObject(rawData);
      }
      const url = `${this.endpoint}${this.id ? `${this.id}/` : ''}`;
      const data: any = this.getPlainObject();
      removeImagesForAPICall(data.attributes);
      if (this.id) {
        this.Patch(url, data)
          .then((response) => {
            if (update) {
              this.setDataFromPlainObject(response);
            }
            res(response);
          })
          .catch((errors) => rej(errors));
      } else {
        this.Post(url, data)
          .then((response) => {
            if (update) {
              this.setDataFromPlainObject(response);
            }
            res(response);
          })
          .catch((errors) => rej(errors));
      }
    });
  }

  public delete(): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.id) {
        return rej({
          message: 'no-id',
          code: '',
          status: 0,
        });
      }
      const url = `${this.endpoint}${this.id}/`;
      this.Delete(url)
        .then(() => res())
        .catch((e) => rej(e));
    });
  }

  public get id() {
    return this._id.value;
  }
  public set id(value) {
    this._id.value = value;
  }

  public get URLBase() {
    return this._URLBase.value;
  }
  public set URLBase(value) {
    this._URLBase.value = value;
  }

  public get URLParameters() {
    return this._URLParameters.value;
  }
  public set URLParameters(value) {
    this._URLParameters.value = value;
  }

  public get jwt() {
    return this._jwt.value;
  }
  public set jwt(value) {
    this._jwt.value = value;
  }

  public get redisKey() {
    let key = this.type;
    if (this.attributes.slug) {
      key += `-${this.attributes.slug}`;
    } else if (this.id) {
      key += `-${this.id}`;
    }
    return key;
  }

  public get isLoading() {
    return this._isLoading.value;
  }
  public set isLoading(value) {
    this._isLoading.value = value;
  }
}
