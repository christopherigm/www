import { Signal, signal } from '@preact-signals/safe-react';
import Languages from '@repo/interfaces/languages';
import { SaveCookie } from '@repo/helpers/cookie-handler';
import GetBooleanFromString from '@repo/helpers/get-boolean-from-string';
import { JWTPayload } from '@repo/interfaces/jwt-interface';
import type { RedisClientType } from 'redis';
import GetEnvVariables from '@repo/helpers/get-env-variables';

export abstract class CachedValues {
  private _language: Signal<Languages> = signal('en');
  private _darkMode: Signal<boolean> = signal(false);
  private _devMode: Signal<boolean> = signal(false);

  public parseCookies(object: any) {
    if (object) {
      this.language = object.language ?? this.language;
      this.darkMode = GetBooleanFromString(object.darkMode);
      this.devMode = GetBooleanFromString(object.devMode);
    }
  }

  public getPlainObject(): any {
    return {
      language: this.language,
      darkMode: this.darkMode,
      devMode: this.devMode,
    };
  }

  public setDataFromPlainObject(object: any) {
    if (object) {
      this.language =
        object.defaultLanguage ?? object.language ?? this.language;
      this.darkMode = object.darkMode ?? this.darkMode;
      this.devMode = object.devMode ?? this.devMode;
    }
  }

  public get language() {
    return this._language.value;
  }
  public set language(value) {
    this._language.value = value;
  }

  public get darkMode() {
    return this._darkMode.value;
  }
  public set darkMode(value) {
    this._darkMode.value = value;
  }

  public get devMode() {
    return this._devMode.value;
  }
  public set devMode(value) {
    this._devMode.value = value;
  }
}

export abstract class EnvironmentVariables extends CachedValues {
  private _hostName: Signal<string> = signal('');
  private _URLBase: Signal<string> = signal('');
  private _K8sURLBase: Signal<string> = signal('');
  private _REDIS_URL: Signal<string> = signal('');
  private _defaultLanguage: Signal<string> = signal('');
  private _logo: Signal<string> = signal('');
  private _loginEnabled: Signal<boolean> = signal(false);
  private _cartEnabled: Signal<boolean> = signal(false);
  private _favoritesEnabled: Signal<boolean> = signal(false);
  private _ordersEnabled: Signal<boolean> = signal(false);
  private _version: Signal<string> = signal('');
  private _favicon: Signal<string> = signal('');
  private _ogTitle: Signal<string> = signal('');
  private _ogSite: Signal<string> = signal('');
  private _ogIMG: Signal<string> = signal('');
  private _ogURL: Signal<string> = signal('');
  private _ogDescription: Signal<string> = signal('');

  private _isLoading: Signal<boolean> = signal(false);
  private _redis: Signal<RedisClientType | null> = signal(null);

  constructor() {
    super();
    const env = GetEnvVariables();
    this.hostName = env.hostName ?? this.hostName;
    this.URLBase = env.URLBase ?? this.URLBase;
    this.K8sURLBase = env.K8sURLBase ?? this.K8sURLBase;
    this.redisURL = env.redisURL ?? this.redisURL;
    this.defaultLanguage = env.defaultLanguage ?? this.defaultLanguage;
    this.logo = env.logo ?? this.logo;
    this.loginEnabled = env.loginEnabled ?? this.loginEnabled;
    this.cartEnabled = env.cartEnabled ?? this.cartEnabled;
    this.favoritesEnabled = env.favoritesEnabled ?? this.favoritesEnabled;
    this.ordersEnabled = env.ordersEnabled ?? this.ordersEnabled;
    this.version = env.version ?? this.version;
    this.favicon = env.favicon ?? this.favicon;
    this.ogTitle = env.ogTitle ?? this.ogTitle;
    this.ogSite = env.ogSite ?? this.ogSite;
    this.ogImg = env.ogImg ?? this.ogImg;
    this.ogURL = env.ogURL ?? this.ogURL;
    this.ogDescription = env.ogDescription ?? this.ogDescription;
  }

  public switchLoading(v: boolean): void {
    this.isLoading = v;
  }

  public setDataFromPlainObject(object: any) {
    if (object) {
      this.hostName = object.hostName ?? this.hostName;
      this.URLBase = object.URLBase ?? this.URLBase;
      this.K8sURLBase = object.K8sURLBase ?? this.K8sURLBase;
      this.defaultLanguage = object.defaultLanguage ?? this.defaultLanguage;
      this.logo = object.logo ?? this.logo;
      this.loginEnabled = object.loginEnabled ?? this.loginEnabled;
      this.cartEnabled = object.cartEnabled ?? this.cartEnabled;
      this.favoritesEnabled = object.favoritesEnabled ?? this.favoritesEnabled;
      this.ordersEnabled = object.ordersEnabled ?? this.ordersEnabled;
      this.version = object.version ?? this.version;
      this.favicon = object.favicon ?? this.favicon;
      this.ogTitle = object.ogTitle ?? this.ogTitle;
      this.ogSite = object.ogSite ?? this.ogSite;
      this.ogImg = object.ogImg ?? this.ogImg;
      this.ogURL = object.ogURL ?? this.ogURL;
      this.ogDescription = object.ogDescription ?? this.ogDescription;
      this.isLoading = object.isLoading ?? this.isLoading;
      super.setDataFromPlainObject({
        ...object,
        defaultLanguage: this.defaultLanguage,
      });
    }
  }

  public getPlainObject(): any {
    return {
      ...super.getPlainObject(),
      hostName: this.hostName,
      URLBase: this.URLBase,
      K8sURLBase: this.K8sURLBase,
      defaultLanguage: this.defaultLanguage,
      logo: this.logo,
      loginEnabled: this.loginEnabled,
      cartEnabled: this.cartEnabled,
      favoritesEnabled: this.favoritesEnabled,
      ordersEnabled: this.ordersEnabled,
      version: this.version,
      favicon: this.favicon,
      ogTitle: this.ogTitle,
      ogSite: this.ogSite,
      ogImg: this.ogImg,
      ogURL: this.ogURL,
      ogDescription: this.ogDescription,
    };
  }

  public get hostName() {
    return this._hostName.value;
  }
  public set hostName(value) {
    this._hostName.value = value;
  }

  public get URLBase() {
    return this._URLBase.value;
  }
  public set URLBase(value) {
    this._URLBase.value = value;
  }

  public get K8sURLBase() {
    return this._K8sURLBase.value;
  }
  public set K8sURLBase(value) {
    this._K8sURLBase.value = value;
  }

  public get redisURL() {
    return this._REDIS_URL.value;
  }
  public set redisURL(value) {
    this._REDIS_URL.value = value;
  }

  public get redis() {
    return this._redis.value;
  }
  public set redis(value) {
    this._redis.value = value;
  }

  public get defaultLanguage() {
    return this._defaultLanguage.value;
  }
  public set defaultLanguage(value) {
    this._defaultLanguage.value = value;
  }

  public get logo() {
    return this._logo.value;
  }
  public set logo(value) {
    this._logo.value = value;
  }

  public get loginEnabled() {
    return this._loginEnabled.value;
  }
  public set loginEnabled(value) {
    this._loginEnabled.value = value;
  }

  public get cartEnabled() {
    return this._cartEnabled.value;
  }
  public set cartEnabled(value) {
    this._cartEnabled.value = value;
  }

  public get favoritesEnabled() {
    return this._favoritesEnabled.value;
  }
  public set favoritesEnabled(value) {
    this._favoritesEnabled.value = value;
  }

  public get ordersEnabled() {
    return this._ordersEnabled.value;
  }
  public set ordersEnabled(value) {
    this._ordersEnabled.value = value;
  }

  public get version() {
    return this._version.value;
  }
  public set version(value) {
    this._version.value = value;
  }

  public get favicon() {
    return this._favicon.value;
  }
  public set favicon(value) {
    this._favicon.value = value;
  }

  public get ogTitle() {
    return this._ogTitle.value;
  }
  public set ogTitle(value) {
    this._ogTitle.value = value;
  }

  public get ogSite() {
    return this._ogSite.value;
  }
  public set ogSite(value) {
    this._ogSite.value = value;
  }

  public get ogImg() {
    return this._ogIMG.value;
  }
  public set ogImg(value) {
    this._ogIMG.value = value;
  }

  public get ogURL() {
    return this._ogURL.value;
  }
  public set ogURL(value) {
    this._ogURL.value = value;
  }

  public get ogDescription() {
    return this._ogDescription.value;
  }
  public set ogDescription(value) {
    this._ogDescription.value = value;
  }

  public get isLoading() {
    return this._isLoading.value;
  }
  public set isLoading(value) {
    this._isLoading.value = value;
  }
}
export abstract class BaseSystem extends EnvironmentVariables {
  protected type: string = 'System';
  private _paths: Signal<Array<string>> = signal([]);
  private _jwt: Signal<JWTPayload> = signal({
    exp: 0,
    iat: 0,
    jti: '',
    token_type: '',
    user_id: 0,
    access: '',
    refresh: '',
  });

  public switchTheme(): void {
    this.darkMode = !this.darkMode;
    SaveCookie('darkMode', String(this.darkMode), this.paths);
  }

  public switchDevMode(): void {
    this.devMode = !this.devMode;
    SaveCookie('devMode', String(this.devMode), this.paths);
  }

  public getPlainObject(): any {
    return {
      ...super.getPlainObject(),
      paths: this.paths,
    };
  }

  public setDataFromPlainObject(object: any) {
    if (object) {
      super.setDataFromPlainObject(object);
      this.paths = object.paths ?? this.paths;
    }
  }

  public get paths() {
    return this._paths.value;
  }
  public set paths(value) {
    this._paths.value = value;
  }
}
