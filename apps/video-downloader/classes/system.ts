import { Signal, signal } from '@preact-signals/safe-react';
import API from '@repo/helpers/api/index';
import { BaseSystem } from '@repo/classes/base-system';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import isX from '@repo/helpers/is-x-checker';
import Item from '@/classes/item';
import Song, { SongOptions } from '@/classes/song';
import type { DownloadOptions } from '@/classes/item';

export default class System extends BaseSystem {
  public static instance: System;
  private _items: Signal<Array<Item>> = signal([]);
  private _songs: Signal<Array<Song>> = signal([]);
  private _onlineSongs: Signal<Array<Song>> = signal([]);
  private _userAgent: Signal<string> = signal('');
  private _iOS: Signal<boolean> = signal(false);
  private _supported: Signal<boolean> = signal(true);
  private _filterForItems: Signal<string> = signal('');

  public static getInstance(): System {
    return System.instance || new System();
  }

  constructor() {
    super();
    this.paths = ['/', '/editor'];
  }

  public getPlainObject(): any {
    return {
      ...super.getPlainObject(),
      userAgent: this.userAgent,
      iOS: this.iOS,
    };
  }

  public setDataFromPlainObject(object: any): void {
    super.setDataFromPlainObject(object);
    this.userAgent = object.userAgent ?? this.userAgent;
    this.iOS = object.iOS ?? this.iOS;
  }

  public addItem(url: string, options: DownloadOptions) {
    const item = new Item();
    item.URLBase = this.URLBase;
    item.url = url;
    if (isX(url)) {
      item.url = url.replaceAll('x.com', 'twitter.com');
    }
    item.getVideo(options);
    this.items.unshift(item);
    this.items = [...this.items];
    this.saveItemsToLocalStorage();
  }

  public getOnlineSongs() {
    this.isLoading = true;
    API.Get({
      url: '/get-all-songs',
      jsonapi: false,
    })
      .then((songs: Array<any>) => {
        const onlineSongs: Array<Song> = [];
        songs.forEach((i: any) =>
          onlineSongs.push(this.getInstanceFromPlainObject(i))
        );
        this.onlineSongs = onlineSongs.reverse();
      })
      .catch(() => (this.isLoading = false))
      .finally(() => (this.isLoading = false));
  }

  public getInstanceFromPlainObject(data: any): Song {
    const song = new Song();
    song.name = data.name;
    song.prompt = data.prompt;
    if (data.id) {
      song.id = data.id;
    }
    if (data.status) {
      song.status = data.status;
    }
    if (data.llmLyrics) {
      song.llmLyrics = data.llmLyrics;
    }
    if (data.lyricsStyle) {
      song.lyricsStyle = data.lyricsStyle;
    }
    if (data.lyricsEmotions) {
      song.lyricsEmotions = data.lyricsEmotions;
    }
    if (data.lyricsLength) {
      song.lyricsLength = data.lyricsLength;
    }
    if (data.songStyle) {
      song.songStyle = data.songStyle;
    }
    if (data.model) {
      song.model = data.model;
    }
    if (data.songStyleBoost) {
      song.songStyleBoost = data.songStyleBoost;
    }
    if (data.negativePrompt) {
      song.negativePrompt = data.negativePrompt;
    }
    if (data.llmSongStyle) {
      song.llmSongStyle = data.llmSongStyle;
    }
    if (data.songStyleBoost) {
      song.songStyleBoost = data.songStyleBoost;
    }
    if (data.instrumental) {
      song.instrumental = data.instrumental;
    }
    if (data.songs) {
      song.songs = data.songs;
    }
    if (data.retrying) {
      song.retrying = true;
    }
    song.rock = data.rock ?? false;
    song.pop = data.pop ?? false;
    song.electronic = data.electronic ?? false;
    song.metal = data.metal ?? false;
    song.country = data.country ?? false;
    song.mariachi = data.mariachi ?? false;
    song.ballad = data.ballad ?? false;
    song.jazz = data.jazz ?? false;
    song.prehispanic = data.prehispanic ?? false;
    song.tropical = data.tropical ?? false;
    song.cumbia = data.cumbia ?? false;
    song.salsa = data.salsa ?? false;
    song.trio = data.trio ?? false;
    song.trap = data.trap ?? false;
    song.merengue = data.merengue ?? false;
    song.mambo = data.mambo ?? false;
    song.ranchera = data.ranchera ?? false;
    song.mexican_regional = data.mexican_regional ?? false;
    song.corrido = data.corrido ?? false;
    song.norteno = data.norteno ?? false;
    song.tribal = data.tribal ?? false;
    song.sinaloa_band = data.sinaloa_band ?? false;
    song.bachata = data.bachata ?? false;
    song.reggaeton = data.reggaeton ?? false;
    song.reggae = data.reggae ?? false;
    song.urban = data.urban ?? false;
    song.k_pop = data.k_pop ?? false;
    song.hip_hop = data.hip_hop ?? false;
    song.rap = data.rap ?? false;
    song.blues = data.blues ?? false;
    song.ska = data.ska ?? false;
    song.indie = data.indie ?? false;
    song.acoustic = data.acoustic ?? false;
    song.rb = data.rb ?? false;

    song.happyness = data.happyness ?? false;
    song.joy = data.joy ?? false;
    song.love = data.love ?? false;
    song.sadness = data.sadness ?? false;
    song.proud = data.proud ?? false;
    song.romantic = data.romantic ?? false;
    song.nostalgic = data.nostalgic ?? false;
    song.spite = data.spite ?? false;
    song.angry = data.angry ?? false;
    song.melodic = data.melodic ?? false;
    song.modern = data.modern ?? false;
    song.emotional = data.emotional ?? false;
    song.clean_rhythm = data.clean_rhythm ?? false;
    song.melodic_chorus = data.melodic_chorus ?? false;

    song.piano = data.piano ?? false;
    song.guitar = data.guitar ?? false;
    song.electric_guitar = data.electric_guitar ?? false;
    song.requinto = data.requinto ?? false;
    song.bass = data.bass ?? false;
    song.trompets = data.trompets ?? false;
    song.violin = data.violin ?? false;
    song.accordion = data.accordion ?? false;
    song.saxophone = data.saxophone ?? false;
    song.synthesizer = data.synthesizer ?? false;
    song.drums = data.drums ?? false;
    song.hardDrums = data.hardDrums ?? false;

    if (data.voices) {
      song.voices = data.voices;
    }

    return song;
  }

  public addSong(options: SongOptions): Promise<void> {
    return new Promise((res, rej) => {
      const song = this.getInstanceFromPlainObject(options);
      song
        .getSong()
        .then((response: any) => {
          song.id = response.id;
          if (response.status) {
            song.status = response.status;
          }
          if (response.taskID) {
            song.taskID = response.taskID;
          }
          const index = this.songs.findIndex((i: Song) => i.id === song.id);
          if (index > -1) {
            this.songs.splice(index, 1);
          }
          this.songs.unshift(song);
          this.songs = [...this.songs];
          this.saveSongsToLocalStorage();
          res();
        })
        .catch((e) => {
          this.songs.unshift(song);
          this.songs = [...this.songs];
          this.saveSongsToLocalStorage();
          rej(e);
        });
    });
  }

  public deleteItem(id: string) {
    const filter = this.filterForItems;
    this.filterForItems = '';
    if (this.items.length === 1) {
      this.items = [];
    } else {
      const index = this.items.findIndex((i: Item) => i.id === id);
      if (index > -1) {
        this.items[index]?.cancelRequest();
        this.items.splice(index, 1);
        this.items = [...this.items];
      }
    }
    this.saveItemsToLocalStorage();
    this.filterForItems = filter;
  }

  public deleteSong(id: string) {
    const index = this.songs.findIndex((i: Song) => i.id === id);
    if (index > -1 && this.songs[index]) {
      this.songs[index]
        .deleteSong()
        .catch((e) => alert(e))
        .finally(() => {
          this.songs[index].status = 'deleted';
          this.songs.splice(index, 1);
          this.songs = [...this.songs];
          this.saveSongsToLocalStorage();
        });
    } else {
      const onlineIndex = this.onlineSongs.findIndex((i: Song) => i.id === id);
      if (onlineIndex > -1 && this.onlineSongs[onlineIndex]) {
        this.onlineSongs[onlineIndex]
          .deleteSong()
          .catch((e) => alert(e))
          .finally(() => {
            this.onlineSongs[onlineIndex].status = 'deleted';
            this.onlineSongs.splice(onlineIndex, 1);
            this.onlineSongs = [...this.onlineSongs];
          });
      }
    }
  }

  public saveItemsToLocalStorage() {
    const itemsToSave = this.items.map((i: Item) => {
      return i.getItemToSaveInLocalStorage();
    });
    SetLocalStorageData('items', JSON.stringify(itemsToSave));
  }

  public saveSongsToLocalStorage() {
    const itemsToSave = this.songs.map((i: Song) => {
      return i.getSongToSaveInLocalStorage();
    });
    SetLocalStorageData('songs', JSON.stringify(itemsToSave));
  }

  public getItemsFromLocalStorage() {
    let cachedItems: any = GetLocalStorageData('items');
    if (cachedItems) {
      cachedItems = JSON.parse(cachedItems) as Array<any>;
      this.items = cachedItems.map((i: any) => {
        const newItem = new Item();
        newItem.id = i.id;
        newItem.URLBase = this.URLBase;
        newItem.name = i.name;
        newItem.filename = i.filename;
        newItem.status = i.status;
        newItem.url = i.url;
        newItem.error = i.error;
        newItem.created = i.created;
        newItem.completed = i.completed;
        newItem.nodeName = i.nodeName || '';
        newItem.justAudio = i.justAudio;
        newItem.hdTikTok = i.hdTikTok;
        newItem.FPS60 = i.FPS60;
        newItem.autoDownload = i.autoDownload;
        newItem.resourceDownloaded =
          i.resourceDownloaded !== undefined ? i.resourceDownloaded : true;
        newItem.userFolder = i.userFolder;
        if (!i.type) {
          newItem.setType();
        } else {
          newItem.type = i.type;
        }
        newItem.checkStatus();
        return newItem;
      });
    }
  }

  public getSongsFromLocalStorage() {
    let cachedItems: any = GetLocalStorageData('songs');
    if (cachedItems) {
      cachedItems = JSON.parse(cachedItems) as Array<any>;
      this.songs = cachedItems.map((i: any) => {
        const newItem = new Song();
        newItem.id = i.id;
        newItem.URLBase = this.URLBase;
        newItem.name = i.name;
        newItem.status = i.status;
        newItem.songs = i.songs;
        newItem.prompt = i.prompt;
        newItem.lyricsStyle = i.lyricsStyle;
        newItem.lyricsEmotions = i.lyricsEmotions;
        newItem.lyricsLength = Number(i.lyricsLength);
        newItem.songStyle = i.songStyle;
        newItem.negativePrompt = i.negativePrompt;
        newItem.llmSongStyle = i.llmSongStyle;
        newItem.songStyleBoost = i.songStyleBoost;
        newItem.llmLyrics = i.llmLyrics;
        newItem.instrumental = i.instrumental;
        newItem.taskID = i.taskID;
        newItem.model = i.model;
        newItem.retrying = i.retrying;

        newItem.rock = i.rock ?? false;
        newItem.pop = i.pop ?? false;
        newItem.electronic = i.electronic ?? false;
        newItem.metal = i.metal ?? false;
        newItem.country = i.country ?? false;
        newItem.mariachi = i.mariachi ?? false;
        newItem.ballad = i.ballad ?? false;
        newItem.jazz = i.jazz ?? false;
        newItem.prehispanic = i.prehispanic ?? false;
        newItem.tropical = i.tropical ?? false;
        newItem.cumbia = i.cumbia ?? false;
        newItem.salsa = i.salsa ?? false;
        newItem.trio = i.trio ?? false;
        newItem.trap = i.trap ?? false;
        newItem.merengue = i.merengue ?? false;
        newItem.mambo = i.mambo ?? false;
        newItem.ranchera = i.ranchera ?? false;
        newItem.mexican_regional = i.mexican_regional ?? false;
        newItem.corrido = i.corrido ?? false;
        newItem.norteno = i.norteno ?? false;
        newItem.tribal = i.tribal ?? false;
        newItem.sinaloa_band = i.sinaloa_band ?? false;
        newItem.bachata = i.bachata ?? false;
        newItem.reggaeton = i.reggaeton ?? false;
        newItem.reggae = i.reggae ?? false;
        newItem.urban = i.urban ?? false;
        newItem.k_pop = i.k_pop ?? false;
        newItem.hip_hop = i.hip_hop ?? false;
        newItem.rap = i.rap ?? false;
        newItem.blues = i.blues ?? false;
        newItem.ska = i.ska ?? false;
        newItem.indie = i.indie ?? false;
        newItem.acoustic = i.acoustic ?? false;
        newItem.rb = i.rb ?? false;

        newItem.happyness = i.happyness ?? false;
        newItem.joy = i.joy ?? false;
        newItem.love = i.love ?? false;
        newItem.sadness = i.sadness ?? false;
        newItem.proud = i.proud ?? false;
        newItem.romantic = i.romantic ?? false;
        newItem.nostalgic = i.nostalgic ?? false;
        newItem.spite = i.spite ?? false;
        newItem.angry = i.angry ?? false;
        newItem.melodic = i.melodic ?? false;
        newItem.modern = i.modern ?? false;
        newItem.emotional = i.emotional ?? false;
        newItem.clean_rhythm = i.clean_rhythm ?? false;
        newItem.melodic_chorus = i.melodic_chorus ?? false;

        newItem.piano = i.piano ?? false;
        newItem.guitar = i.guitar ?? false;
        newItem.electric_guitar = i.electric_guitar ?? false;
        newItem.requinto = i.requinto ?? false;
        newItem.bass = i.bass ?? false;
        newItem.trompets = i.trompets ?? false;
        newItem.violin = i.violin ?? false;
        newItem.accordion = i.accordion ?? false;
        newItem.saxophone = i.saxophone ?? false;
        newItem.synthesizer = i.synthesizer ?? false;
        newItem.drums = i.drums ?? false;
        newItem.hardDrums = i.hardDrums ?? false;

        newItem.voices = i.voices ?? [];

        newItem.checkStatus();
        return newItem;
      });
    }
  }

  public checkForiOS(): void {
    const iOS =
      this.userAgent.indexOf('iPad') > -1 ||
      this.userAgent.indexOf('iPhone') > -1;
    this.iOS = iOS;
  }

  public get items() {
    if (this.filterForItems !== '') {
      return this._items.value.filter(
        (i: Item) =>
          i.name.toLowerCase().indexOf(this.filterForItems.toLowerCase()) > -1
      );
    }
    return this._items.value;
  }
  public set items(value) {
    this._items.value = value;
  }

  public get songs() {
    if (this.filterForItems !== '') {
      return this._songs.value.filter(
        (i: Song) =>
          i.name.toLowerCase().indexOf(this.filterForItems.toLowerCase()) > -1
      );
    }
    return this._songs.value;
  }
  public set songs(value) {
    this._songs.value = value;
  }

  public get onlineSongs() {
    if (this.filterForItems !== '') {
      return this._onlineSongs.value.filter(
        (i: Song) =>
          i.name.toLowerCase().indexOf(this.filterForItems.toLowerCase()) > -1
      );
    }
    return this._onlineSongs.value;
  }
  public set onlineSongs(value) {
    this._onlineSongs.value = value;
  }

  public get userAgent() {
    return this._userAgent.value;
  }
  public set userAgent(value) {
    this._userAgent.value = value;
  }

  public get iOS() {
    return this._iOS.value;
  }
  public set iOS(value) {
    this._iOS.value = value;
  }

  public get supported() {
    return this._supported.value;
  }
  public set supported(value) {
    this._supported.value = value;
  }

  public get filterForItems() {
    return this._filterForItems.value;
  }
  public set filterForItems(value) {
    this._filterForItems.value = value;
  }
}

export const system = signal(new System());
