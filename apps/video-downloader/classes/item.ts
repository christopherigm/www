'use-client';

import { Signal, signal } from '@preact-signals/safe-react';
//https://ffmpegwasm.netlify.app/docs/getting-started/usage/

import API from '@repo/helpers/api/index';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import isTidal from '@repo/helpers/is-tidal-checker';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isYoutube from '@repo/helpers/is-youtube-checker';
import isInstagram from '@repo/helpers/is-instagram-checker';
import isFacebook from '@repo/helpers/is-facebook-checker';
import isTwitter from '@repo/helpers/is-x-checker';
import isPinterest from '@repo/helpers/is-pinterest-checker';
import RandomNumber from '@repo/helpers/random-number';
import { SubstractDates } from '@repo/helpers/date-parser';

type Status =
  | 'downloading'
  | 'none'
  | 'ready'
  | 'error'
  | 'processing-h264'
  | 'deleted'
  | 'canceled';
export type VideoType =
  | 'audio'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'pinterest'
  | 'tidal';

export type DownloadOptions = {
  justAudio?: boolean;
  hdTikTok?: boolean;
  FPS60?: boolean;
  autoDownload?: boolean;
  userFolder?: string;
};

export default class Item {
  public static instance: Item;
  private _id: Signal<string> = signal('');
  private _URLBase: Signal<string> = signal('');
  private _message: Signal<string> = signal('');
  private _name: Signal<string> = signal('');
  private _filename: Signal<string> = signal('');
  private _status: Signal<Status> = signal('none');
  private _processingStatus: Signal<string> = signal('');
  private _url: Signal<string> = signal('');
  private _type: Signal<VideoType | null> = signal(null);
  private _blob: Signal<Blob> = signal(new Blob());
  private _error: Signal<string | null> = signal(null);
  private _created: Signal<Date | null> = signal(null);
  private _completed: Signal<Date | null> = signal(null);
  private _nodeName: Signal<string> = signal('');
  private _justAudio: Signal<boolean> = signal(false);
  private _hdTikTok: Signal<boolean> = signal(false);
  private _FPS60: Signal<boolean> = signal(false);
  private _resourceDownloaded: Signal<boolean> = signal(false);
  private _autoDownload: Signal<boolean> = signal(false);
  private _userFolder: Signal<string> = signal('');
  private _processedVideoLink: Signal<string> = signal('');

  public static getInstance(): Item {
    return Item.instance || new Item();
  }

  private handleResponse(response: Item) {
    this.id = response.id;
    if (response.filename) {
      this.filename = response.filename;
    }
    if (response.status) {
      this.status = response.status;
    }
    if (response.name) {
      this.name = response.name;
    }
    if (response.nodeName) {
      this.nodeName = response.nodeName;
    }
    this.message = response.message;
    this.error = response.error;
    this.created = response.created || null;
    this.completed = response.completed || null;
    if (
      this.status === 'ready' &&
      this.autoDownload &&
      this.resourceDownloaded === false
    ) {
      this.downloadResource();
      this.resourceDownloaded = true;
    }
    this.updateLocalStorageItem();
  }

  public setType() {
    if (!this.url || this.type) {
      return;
    }
    if (this.justAudio) {
      this.type = 'audio';
    } else if (isYoutube(this.url)) {
      this.type = 'youtube';
    } else if (isInstagram(this.url)) {
      this.type = 'instagram';
    } else if (isTiktok(this.url)) {
      this.type = 'tiktok';
    } else if (isFacebook(this.url)) {
      this.type = 'facebook';
    } else if (isTwitter(this.url)) {
      this.type = 'twitter';
    } else if (isPinterest(this.url)) {
      this.type = 'pinterest';
    } else if (isTidal(this.url)) {
      this.type = 'tidal';
    }
  }

  public setNewRandomID(): void {
    const newRandomID = RandomNumber(1, 9999);
    if (this.url.search(/\?vdRID/) > -1) {
      this.url = this.url.split(/\?vdRID/)[0] ?? this.url;
    }
    if (this.url.search(/\&vdRID/) > -1) {
      this.url = this.url.split(/\&vdRID/)[0] ?? this.url;
    }
    if (this.url.search(/\?/) > -1) {
      this.url += '&vdRID=';
    } else {
      this.url += '?vdRID=';
    }
    this.url += newRandomID;
  }

  public downloadResource() {
    if (!this.videoLink) {
      return;
    }
    const element = document.createElement('a');
    element.setAttribute('href', encodeURI(this.videoLink));
    element.setAttribute('download', this.videoLink);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.resourceDownloaded = true;
    this.updateLocalStorageItem();
  }

  public getVideo(options?: DownloadOptions) {
    if (!this.URLBase || !this.url) {
      return;
    }
    this.setType();
    let force = false;
    if (
      this.status === 'ready' ||
      this.status === 'error' ||
      this.status === 'canceled'
    ) {
      this.status = 'none';
      this.error = '';
      force = true;
      this.updateLocalStorageItem();
    }
    if (options) {
      this.justAudio = options?.justAudio ?? false;
      this.hdTikTok = options?.hdTikTok ?? false;
      this.FPS60 = options?.FPS60 ?? false;
      this.autoDownload = options?.autoDownload ?? false;
      this.userFolder = options?.userFolder ?? '';
    }
    const url = '/download-video';
    const data: any = {
      url: this.url,
      justAudio: this.justAudio,
      hdTikTok: this.hdTikTok,
      FPS60: this.FPS60,
      userFolder: this.userFolder,
      force,
    };
    if (this.id) {
      data.id = this.id;
    }
    this.setNewRandomID();
    API.Post({
      url,
      data,
      jsonapi: false,
    })
      .then((response: Item) => {
        this.handleResponse(response);
        this.checkStatus();
      })
      .catch(() => {
        if (!this.status) {
          this.status = 'downloading';
          this.updateLocalStorageItem();
        }
      });
  }

  public cancelRequest() {
    this.status = 'canceled';
    this.updateLocalStorageItem();
  }

  public checkStatus() {
    if (
      !this.URLBase ||
      !this.url ||
      this.status === 'ready' ||
      this.status === 'canceled' ||
      this.status === 'deleted' ||
      this.status === 'error'
    ) {
      return;
    }
    if (this.id) {
      API.Get({
        url: `/get-videos/${this.id}`,
        jsonapi: false,
      })
        .then((response: Item) => this.handleResponse(response))
        .catch(() => {
          if (!this.status) {
            this.status = 'downloading';
            this.updateLocalStorageItem();
          }
        })
        .finally(() => setTimeout(() => this.checkStatus(), 5000));
    } else if (this.url) {
      API.Post({
        url: `/get-video-name`,
        jsonapi: false,
        data: {
          url: this.url,
          justAudio: this.justAudio,
          hdTikTok: this.hdTikTok,
          FPS60: this.FPS60,
          userFolder: this.userFolder,
        },
      })
        .then((response: Item) => this.handleResponse(response))
        .catch(() => {
          if (!this.status) {
            this.status = 'downloading';
            this.updateLocalStorageItem();
          }
        })
        .finally(() => setTimeout(() => this.checkStatus(), 5000));
    }
  }

  public updateLocalStorageItem() {
    const items: Array<any> = this.getItemFromLocalStorage();
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === this.id || items[i].url === this.url) {
        items[i] = this.getItemToSaveInLocalStorage();
      }
    }
    SetLocalStorageData('items', JSON.stringify(items));
  }

  public getItemFromLocalStorage(): Array<Item> {
    let cachedItems: any = GetLocalStorageData('items');
    if (cachedItems) {
      cachedItems = (JSON.parse(cachedItems) as Array<any>) ?? [];
      return cachedItems;
    }
    return [];
  }

  public getItemToSaveInLocalStorage() {
    return {
      id: this.id,
      URLBase: this.URLBase,
      name: this.name,
      filename: this.filename,
      status: this.status,
      url: this.url,
      type: this.type,
      error: this.error,
      created: this.created,
      nodeName: this.nodeName,
      completed: this.completed,
      justAudio: this.justAudio,
      hdTikTok: this.hdTikTok,
      FPS60: this.FPS60,
      autoDownload: this.autoDownload,
      resourceDownloaded: this.resourceDownloaded,
      userFolder: this.userFolder,
    };
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

  public get message() {
    return this._message.value;
  }
  public set message(value) {
    this._message.value = value;
  }

  public get name() {
    return this._name.value;
  }
  public set name(value) {
    this._name.value = value;
  }

  public get filename() {
    return this._filename.value;
  }
  public set filename(value) {
    this._filename.value = value;
  }

  public get status() {
    return this._status.value;
  }
  public set status(value) {
    this._status.value = value;
  }

  public get processingStatus() {
    return this._processingStatus.value;
  }
  public set processingStatus(value) {
    this._processingStatus.value = value;
  }

  public get url() {
    return this._url.value;
  }
  public set url(value) {
    this._url.value = value;
  }

  public get blob() {
    return this._blob.value;
  }
  public set blob(value) {
    this._blob.value = value;
  }

  public get error() {
    return this._error.value;
  }
  public set error(value) {
    this._error.value = value;
  }

  public get created() {
    return this._created.value;
  }
  public set created(value) {
    this._created.value = value;
  }

  public get completed() {
    return this._completed.value;
  }
  public set completed(value) {
    this._completed.value = value;
  }

  public get nodeName() {
    return this._nodeName.value;
  }
  public set nodeName(value) {
    this._nodeName.value = value;
  }

  public get justAudio() {
    return this._justAudio.value;
  }
  public set justAudio(value) {
    this._justAudio.value = value;
  }

  public get hdTikTok() {
    return this._hdTikTok.value;
  }
  public set hdTikTok(value) {
    this._hdTikTok.value = value;
  }

  public get FPS60() {
    return this._FPS60.value;
  }
  public set FPS60(value) {
    this._FPS60.value = value;
  }

  public get resourceDownloaded() {
    return this._resourceDownloaded.value;
  }
  public set resourceDownloaded(value) {
    this._resourceDownloaded.value = value;
  }

  public get autoDownload() {
    return this._autoDownload.value;
  }
  public set autoDownload(value) {
    this._autoDownload.value = value;
  }

  public get userFolder() {
    return this._userFolder.value;
  }
  public set userFolder(value) {
    this._userFolder.value = value;
  }

  public get videoLink(): string {
    let videoLink = '';
    if (this.URLBase && this.id && this.status === 'ready') {
      // videoLink = this.filename
      //   ? `${this.URLBase}/media/${this.filename}`
      //   : this.justAudio
      //     ? `${this.URLBase}/media/${this.id}.${this.justAudio ? 'm4a' : 'mp4'}`
      //     : '';
      videoLink = this.filename
        ? `/media/${this.filename}`
        : this.justAudio
          ? `/media/${this.id}.${this.justAudio ? 'm4a' : 'mp4'}`
          : '';
      videoLink = videoLink.replaceAll('api/', '');
    }
    return videoLink;
  }

  public get tidalEmbededLink(): string {
    let link = '';
    let id = '';
    let items: Array<string> = [];
    const hasBrowse =
      this.url && this.type === 'tidal' && this.url.search(/browse/) > -1;
    if (hasBrowse) {
      items = this.url.split('browse');
    } else if (
      this.url &&
      this.type === 'tidal' &&
      this.url.search(/tidal\.com\//) > -1
    ) {
      items = this.url.split('tidal.com');
    }
    if (items.length > 1 && items[1]) {
      id = items[1];
    }
    if (id) {
      link = `https://embed.tidal.com${id}`;
      link = link.replace(/track/, 'tracks');
      link = link.replace(/album/, 'albums');
    }
    return link;
  }

  public get completedTime(): string {
    let time = 0;
    if (this.created && this.completed) {
      const diff = SubstractDates(
        new Date(this.completed),
        new Date(this.created)
      );
      const seconds = diff.getSeconds();
      const minutesToSeconds = diff.getMinutes() * 60;
      time = seconds + minutesToSeconds;
    }
    if (!time) {
      return '';
    } else if (time >= 60) {
      time = time / 60;
      return `${time.toFixed(2)} minutes`;
    }
    return `${time} seconds`;
  }

  public get processedVideoLink() {
    return this._processedVideoLink.value;
  }
  public set processedVideoLink(value) {
    this._processedVideoLink.value = value;
  }

  public get type() {
    return this._type.value;
  }
  public set type(value) {
    this._type.value = value;
  }
}

export const item = signal<Item>(Item.getInstance()).value;
