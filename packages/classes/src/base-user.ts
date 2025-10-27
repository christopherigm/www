import * as jose from 'jose';
import { Signal, signal } from '@preact-signals/safe-react';
import { SetLocalStorageData } from '@repo/helpers/local-storage';
import { DeleteCookie } from '@repo/helpers/cookie-handler';
import type { JWTPayload } from '@repo/interfaces/jwt-interface';
import CommonFields from './common-fields';
import BaseAPIClass from './base-class';

export class BaseUser extends BaseAPIClass {
  public static instance: BaseUser;
  public type = 'User';
  public endpoint = 'v1/users/';
  public activateUserEndpoint = 'v1/activate-user/';
  public attributes: BaseUserAttributes = new BaseUserAttributes();
  public relationships: any;

  public static getInstance(): BaseUser {
    return BaseUser.instance || new BaseUser();
  }

  public saveJWTToLocalStorage() {
    SetLocalStorageData('jwt', JSON.stringify(this.jwt));
  }

  public deleteJWTFromLocalStorage() {
    SetLocalStorageData('jwt', '');
  }

  public logout() {
    this.deleteJWTFromLocalStorage();
    this.deleteLocalStorage();
    this.attributes = new BaseUserAttributes();
    this.id = 0;
  }

  public setItemByIDFromAPI(): Promise<void> {
    return new Promise((res, rej) => {
      this.setURLParametersForWholeObject();
      super
        .setItemByIDFromAPI()
        .then(() => {
          this.saveLocalStorage();
          res();
        })
        .catch((e) => rej(e));
    });
  }

  public get validUsername(): boolean {
    return (
      this.attributes.username.length > 4 &&
      this.attributes.username.search(/^[a-zA-Z0-9_]*$/g) >= 0
    );
  }

  public get validFirstName(): boolean {
    return this.attributes.first_name.search(/^[a-zA-Z ]*$/g) >= 0;
  }

  public get validLastName(): boolean {
    return this.attributes.first_name.search(/^[a-zA-Z ]*$/g) >= 0;
  }

  public get validPassword(): boolean {
    return this.attributes.password.length >= 8;
  }

  public get validRepeatPassword(): boolean {
    if (!this.validPassword) {
      return true;
    }
    return this.attributes.password === this.attributes.repeatNewPassword;
  }

  public get canRegister(): boolean {
    return this.validUsername && this.validRepeatPassword;
  }

  public save(): Promise<void> {
    return new Promise((res, rej) => {
      if (
        this.id &&
        this.attributes.password &&
        this.attributes.newPassword &&
        this.attributes.repeatNewPassword &&
        this.attributes.newPassword === this.attributes.repeatNewPassword
      ) {
        this.login()
          .then(() => {
            this.attributes.password = this.attributes.newPassword;
            super
              .save()
              .then(() => {
                this.attributes.password = '';
                this.attributes.newPassword = '';
                this.attributes.repeatNewPassword = '';
                this.setItemByIDFromAPI()
                  .then(() => res())
                  .catch((e) => rej(e));
              })
              .catch((e) => rej(e));
          })
          .catch((e) => rej(e));
      } else if (this.attributes.email) {
        this.attributes.username = this.attributes.email;
        super
          .save()
          .then(() => {
            this.attributes.password = '';
            this.attributes.newPassword = '';
            this.attributes.repeatNewPassword = '';
            this.setItemByIDFromAPI()
              .then(() => res())
              .catch((e) => rej(e));
          })
          .catch((e) => rej(e));
      } else if (this.attributes.username) {
        super
          .save()
          .then(() => {
            this.attributes.password = '';
            this.attributes.newPassword = '';
            this.attributes.repeatNewPassword = '';
            this.setItemByIDFromAPI()
              .then(() => res())
              .catch((e) => rej(e));
          })
          .catch((e) => rej(e));
      } else {
        rej({
          message: 'error',
          code: '',
          status: 0,
        });
      }
    });
  }

  public login(): Promise<void> {
    return new Promise((res, rej) => {
      if (
        (this.attributes.email || this.attributes.username) &&
        this.attributes.password
      ) {
        const url = 'v1/token/';
        this.Post(url, {
          type: 'TokenObtainPairView',
          attributes: this.attributes.getPlainAttributes(),
        })
          .then((response) => {
            const data = jose.decodeJwt(response.access) as JWTPayload;
            data.access = response.access;
            data.refresh = response.refresh;
            this.jwt = data;
            this.id = Number(data.user_id);
            this.saveJWTToLocalStorage();
            res(this.setItemByIDFromAPI());
          })
          .catch((error: any) => rej(error));
      } else {
        rej(new Error('No credentials'));
      }
    });
  }

  public saveAndLogin(): Promise<void> {
    return new Promise((res, rej) => {
      const password = this.attributes.password;
      this.save()
        .then(() => {
          this.attributes.password = password;
          this.login()
            .then(() => res())
            .catch((error: any) => rej(error));
        })
        .catch((error: any) => rej(error));
    });
  }

  public activate(): Promise<any> {
    return new Promise((res, rej) => {
      const data = {
        type: 'ActivateUser',
        attributes: {
          token: this.attributes.token,
        },
      };
      this.Post(this.activateUserEndpoint, data)
        .then((response) => res(response))
        .catch((error) => rej(error));
    });
  }

  public refreshToken(): Promise<void> {
    return new Promise((res, rej) => {
      this.setAccess();
      this.setDataFromLocalStorage();
      if (!this.id && !this.jwt.refresh) {
        return res();
      } else if (this.id && !this.jwt.refresh) {
        this.deleteJWTFromLocalStorage();
        this.deleteLocalStorage();
        return rej({
          message: '',
          code: 'not-valid-user',
          status: 0,
        });
      } else if (!this.jwt.refresh) {
        return rej({
          message: '',
          code: 'no-refresh-token',
          status: 0,
        });
      }
      const url = 'v1/token/refresh/';
      const data = {
        type: 'TokenRefreshView',
        attributes: {
          access: this.jwt.access,
          refresh: this.jwt.refresh,
        },
      };
      this.Post(url, data)
        .then((response) => {
          const newAccessToken = String(response.access || '');
          this.jwt.access = newAccessToken;
          this.saveJWTToLocalStorage();
          res();
        })
        .catch((error) => {
          if (error.code === 'token_not_valid') {
            this.deleteJWTFromLocalStorage();
            this.deleteLocalStorage();
            DeleteCookie('User');
          }
          rej(error);
        });
    });
  }

  public get short_name(): string {
    const name =
      this.attributes.first_name ||
      this.attributes.last_name ||
      this.attributes.username ||
      '';

    return name;
    // return name.length < 6 ? name : `${name.substring(0, 5)}..`;
  }
}

export class BaseUserAttributes extends CommonFields {
  private _token: Signal<string> = signal('');
  private _is_staff: Signal<boolean> = signal(false);
  private _email: Signal<string> = signal('');
  private _username: Signal<string> = signal('');
  private _password: Signal<string> = signal('');
  private _newPassword: Signal<string> = signal('');
  private _repeatNewPassword: Signal<string> = signal('');
  private _first_name: Signal<string> = signal('');
  private _last_name: Signal<string> = signal('');
  private _img_picture: Signal<string> = signal('');
  private _theme: Signal<string> = signal('');
  private _theme_color: Signal<string> = signal('');
  private _profile_picture_shape: Signal<string> = signal('');
  private _phone_number: Signal<string> = signal('');

  public setAttributesFromPlainObject(object: any) {
    if (object.attributes) {
      super.setAttributesFromPlainObject(object);
      this.is_staff =
        object.attributes.is_staff !== undefined
          ? object.attributes.is_staff
          : false;
      this.email = object.attributes.email ?? this.email;
      this.password = object.attributes.password ?? this.password;
      this.username = object.attributes.username ?? this.username;
      this.first_name = object.attributes.first_name ?? this.first_name;
      this.last_name = object.attributes.last_name ?? this.last_name;
      this.img_picture = object.attributes.img_picture ?? this.img_picture;
      this.theme = object.attributes.theme ?? this.theme;
      this.theme_color = object.attributes.theme_color ?? this.theme_color;
      this.profile_picture_shape =
        object.attributes.profile_picture_shape ?? this.profile_picture_shape;
      this.phone_number = object.attributes.phone_number ?? this.phone_number;
    }
  }

  public getPlainAttributes(): any {
    return {
      ...super.getPlainAttributes(),
      is_staff: this.is_staff,
      ...(this.email && {
        email: this.email,
      }),
      ...(this.username && {
        username: this.username,
      }),
      ...(this.password && {
        password: this.password,
      }),
      ...(this.newPassword && {
        newPassword: this.newPassword,
      }),
      ...(this.repeatNewPassword && {
        repeatNewPassword: this.repeatNewPassword,
      }),
      ...(this.first_name && {
        first_name: this.first_name,
      }),
      ...(this.last_name && {
        last_name: this.last_name,
      }),
      ...(this.img_picture && {
        img_picture: this.img_picture,
      }),
      ...(this.theme && {
        theme: this.theme,
      }),
      ...(this.theme_color && {
        theme_color: this.theme_color,
      }),
      ...(this.profile_picture_shape && {
        profile_picture_shape: this.profile_picture_shape,
      }),
      ...(this.phone_number && {
        phone_number: this.phone_number,
      }),
    };
  }

  public get token() {
    return this._token.value;
  }
  public set token(value) {
    this._token.value = value;
  }

  public get is_staff() {
    return this._is_staff.value;
  }
  public set is_staff(value) {
    this._is_staff.value = value;
  }

  public get email() {
    return this._email.value;
  }
  public set email(value) {
    this._email.value = value;
  }

  public get username() {
    if (!this._username.value) {
      this._username.value = this.email;
    }
    return this._username.value;
  }
  public set username(value) {
    this._username.value = value;
  }

  public get password() {
    return this._password.value;
  }
  public set password(value) {
    this._password.value = value;
  }

  public get newPassword() {
    return this._newPassword.value;
  }
  public set newPassword(value) {
    this._newPassword.value = value;
  }

  public get repeatNewPassword() {
    return this._repeatNewPassword.value;
  }
  public set repeatNewPassword(value) {
    this._repeatNewPassword.value = value;
  }

  public get first_name() {
    return this._first_name.value;
  }
  public set first_name(value) {
    this._first_name.value = value;
  }

  public get last_name() {
    return this._last_name.value;
  }
  public set last_name(value) {
    this._last_name.value = value;
  }

  public get img_picture() {
    return this._img_picture.value;
  }
  public set img_picture(value) {
    this._img_picture.value = value;
  }

  public get theme() {
    return this._theme.value;
  }
  public set theme(value) {
    this._theme.value = value;
  }

  public get theme_color() {
    return this._theme_color.value;
  }
  public set theme_color(value) {
    this._theme_color.value = value;
  }

  public get profile_picture_shape() {
    return this._profile_picture_shape.value;
  }
  public set profile_picture_shape(value) {
    this._profile_picture_shape.value = value;
  }

  public get phone_number() {
    return this._phone_number.value;
  }
  public set phone_number(value) {
    this._phone_number.value = value;
  }
}

export const user = signal<BaseUser>(BaseUser.getInstance());
