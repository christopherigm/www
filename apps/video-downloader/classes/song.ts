/* eslint-disable @typescript-eslint/no-explicit-any */
'use-client';

import { Signal, signal } from '@preact-signals/safe-react';
import API from '@repo/helpers/api/index';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import type Languages from '@repo/interfaces/languages';
import { APISong } from '@/types/song';
import { system } from '@/classes/system';

type Status =
  | 'downloading'
  | 'none'
  | 'ready'
  | 'error'
  | 'deleted'
  | 'canceled'
  | 'maintenance';

export type SongOptions = {
  id?: string;
  name: string;
  prompt: string;
  llmLyrics?: string;
  lyricsStyle?: string;
  songStyle?: string;
  model?: string;
  instrumental?: boolean;
  retrying?: boolean;
};

export default class Song {
  public static instance: Song;
  private _id: Signal<string> = signal('');
  private _URLBase: Signal<string> = signal('');
  private _name: Signal<string> = signal('');
  private _status: Signal<Status> = signal('none');
  private _songs: Signal<Array<APISong>> = signal([]);
  private _retrying: Signal<boolean> = signal(false);
  private _llmErrorCode: Signal<number> = signal(0);

  private _singleSongSelected: Signal<string> = signal('');

  private _prompt: Signal<string> = signal('');
  private _negativePrompt: Signal<string> = signal('');
  private _lyricsStyle: Signal<string> = signal('');
  private _lyricsLength: Signal<number> = signal(2);
  private _lyricsEmotions: Signal<string> = signal('');
  private _llmLyrics: Signal<string> = signal('');
  private _songStyle: Signal<string> = signal('');
  private _llmSongStyle: Signal<string> = signal('');
  private _compiled_style: Signal<string> = signal('');
  private _songReference: Signal<string> = signal('');
  private _songStyleBoost: Signal<boolean> = signal(true);
  private _instrumental: Signal<boolean> = signal(false);

  private _taskID: Signal<string> = signal('');
  private _model: Signal<string> = signal('V5');

  private _isLoading: Signal<boolean> = signal(false);

  private _language: Signal<Languages> = signal('es');

  private _rock: Signal<boolean> = signal(false);
  private _pop: Signal<boolean> = signal(false);
  private _electronic: Signal<boolean> = signal(false);
  private _metal: Signal<boolean> = signal(false);
  private _country: Signal<boolean> = signal(false);
  private _mariachi: Signal<boolean> = signal(false);
  private _ballad: Signal<boolean> = signal(false);
  private _jazz: Signal<boolean> = signal(false);
  private _prehispanic: Signal<boolean> = signal(false);
  private _tropical: Signal<boolean> = signal(false);
  private _cumbia: Signal<boolean> = signal(false);
  private _salsa: Signal<boolean> = signal(false);
  private _trio: Signal<boolean> = signal(false);
  private _trap: Signal<boolean> = signal(false);
  private _merengue: Signal<boolean> = signal(false);
  private _mambo: Signal<boolean> = signal(false);
  private _ranchera: Signal<boolean> = signal(false);
  private _mexican_regional: Signal<boolean> = signal(false);
  private _corrido: Signal<boolean> = signal(false);
  private _norteno: Signal<boolean> = signal(false);
  private _tribal: Signal<boolean> = signal(false);
  private _sinaloa_band: Signal<boolean> = signal(false);
  private _bachata: Signal<boolean> = signal(false);
  private _reggaeton: Signal<boolean> = signal(false);
  private _reggae: Signal<boolean> = signal(false);
  private _urban: Signal<boolean> = signal(false);
  private _k_pop: Signal<boolean> = signal(false);
  private _hip_hop: Signal<boolean> = signal(false);
  private _rap: Signal<boolean> = signal(false);
  private _blues: Signal<boolean> = signal(false);
  private _ska: Signal<boolean> = signal(false);
  private _indie: Signal<boolean> = signal(false);
  private _acoustic: Signal<boolean> = signal(false);
  private _rb: Signal<boolean> = signal(false);

  private _happyness: Signal<boolean> = signal(false);
  private _joy: Signal<boolean> = signal(false);
  private _love: Signal<boolean> = signal(false);
  private _sadness: Signal<boolean> = signal(false);
  private _proud: Signal<boolean> = signal(false);
  private _romantic: Signal<boolean> = signal(false);
  private _nostalgic: Signal<boolean> = signal(false);
  private _spite: Signal<boolean> = signal(false);
  private _angry: Signal<boolean> = signal(false);
  private _melodic: Signal<boolean> = signal(false);
  private _modern: Signal<boolean> = signal(false);
  private _emotional: Signal<boolean> = signal(false);
  private _clean_rhythm: Signal<boolean> = signal(false);
  private _melodic_chorus: Signal<boolean> = signal(false);

  private _piano: Signal<boolean> = signal(false);
  private _guitar: Signal<boolean> = signal(false);
  private _electric_guitar: Signal<boolean> = signal(false);
  private _clean_guitars: Signal<boolean> = signal(false);
  private _requinto: Signal<boolean> = signal(false);
  private _bass: Signal<boolean> = signal(false);
  private _trompets: Signal<boolean> = signal(false);
  private _violin: Signal<boolean> = signal(false);
  private _accordion: Signal<boolean> = signal(false);
  private _saxophone: Signal<boolean> = signal(false);
  private _synthesizer: Signal<boolean> = signal(false);
  private _drums: Signal<boolean> = signal(false);
  private _hardDrums: Signal<boolean> = signal(false);

  private _voices: Signal<Array<string>> = signal([]);

  private _voice_type: Signal<string> = signal('');
  private _voice_style: Signal<string> = signal('');
  private _vocalStyle: Signal<string> = signal('');
  private _duo: Signal<boolean> = signal(false);

  public static getInstance(): Song {
    return Song.instance || new Song();
  }

  private handleResponse(response: any) {
    this.id = response.id;
    if (response.status) {
      this.status = response.status;
    }
    if (response.taskID) {
      this.taskID = response.taskID;
    }
    if (response.name) {
      this.name = response.name;
    }
    if (response.songs) {
      this.songs = response.songs;
    }
    if (response.llmSongStyle) {
      this.llmSongStyle = response.llmSongStyle;
    }
    this.retrying = response.retrying ?? false;
    this.updateLocalStorageItem();
    system.value.saveSongsToLocalStorage();
    system.value.songs = [...system.value.songs];
  }

  public getLyric(): Promise<void> {
    return new Promise((res, rej) => {
      this.isLoading = true;

      const url = '/llm-query';
      let prompt =
        this.language === 'en'
          ? 'Write a song lyrics about: '
          : 'Escribe la letra de una cancion acerca de: ';
      prompt += `"${this.prompt}" `;

      // let finalLyricsStyle = this.lyricsStyle;
      // if (this.lyricsEmotions) {
      //   finalLyricsStyle += '. '
      //   finalLyricsStyle += this.lyricsEmotions;
      // }

      if (this.lyricsStyle) {
        prompt +=
          this.language === 'en'
            ? `Musical style: ${this.lyricsStyle}, `
            : `Estilo musical: ${this.lyricsStyle}, `;
      } else {
        prompt += this.language === 'en' ? 'Song style: ' : 'Cancion estilo: ';
      }

      if (this.lyricsEmotions) {
        prompt +=
          this.language === 'en'
            ? `Emotions: ${this.lyricsEmotions}, `
            : `Emociones: ${this.lyricsEmotions}, `;
      }

      const lyricsLengthEN =
        this.lyricsLength === 3
          ? 'very large'
          : this.lyricsLength === 2
            ? 'medium'
            : 'very small';
      const lyricsLengthES =
        this.lyricsLength === 3
          ? 'muy larga'
          : this.lyricsLength === 2
            ? 'media'
            : 'muy corta';
      if (this.lyricsLength) {
        prompt +=
          this.language === 'en'
            ? `Lyrics lenght: ${lyricsLengthEN}, `
            : `Longitud de la letra: ${lyricsLengthES}, `;
      }

      prompt +=
        this.language === 'en'
          ? 'Melodic pre-chorus, intense chorus, instrumental bridges and at least 2 musical breaks. '
          : 'Pre-coros melódicos, coros intensos y épicos, puentes instrumentalesy al menos 2 break musicales. ';

      let ESWordsToAvoid = 'Don, ideal, certero, vibrar, audaz, fatal, ';
      ESWordsToAvoid += 'fervor, sano, remordimiento, teson, refuerce, ';
      ESWordsToAvoid += 'Zinc, feral.';
      if (this.negativePrompt) {
        prompt +=
          this.language === 'en'
            ? `Words or text to exclude: ${this.negativePrompt}. `
            : `Tienes totalmente prohibido usar cualquiera de las siquientes palabras: ${ESWordsToAvoid}, ${this.negativePrompt}. `;
      } else {
        prompt +=
          this.language === 'en'
            ? `Words or text to exclude: ${ESWordsToAvoid}. `
            : `Tienes totalmente prohibido usar cualquiera de las siquientes palabras: ${ESWordsToAvoid}. `;
      }

      prompt +=
        this.language === 'en'
          ? 'Reply just with the lyrics.'
          : 'Responde solo con la letra de la cancion en Español.';

      // console.log('>>> getLyric prompt:', prompt);

      const data = {
        name: this.name,
        prompt,
        lyricsStyle: this.lyricsStyle,
        ...(this.songReference && {
          reference: this.songReference,
        }),
      };
      API.Post({
        url,
        data,
        jsonapi: false,
      })
        .then((data: Song) => {
          // console.log('>>> getLyric response:', data);
          if (data.id) {
            this.id = data.id;
            this.llmLyrics = '';
            this.checkAILyricsStatus();
          } else {
            this.llmLyrics = 'Error generating content!';
          }
          res();
        })
        .catch((e) => rej(e));
    });
  }

  public checkAILyricsStatus() {
    // console.log('>> checkAILyricsStatus:', this.llmLyrics);
    if (this.llmLyrics || !this.id) {
      return;
    }
    API.Get({
      url: `/check-ai-lyrics-status/?id=${this.id}`,
      jsonapi: false,
    })
      .then((response: Song) => {
        // console.log('>> checkAILyricsStatus:', response);
        if (response.llmLyrics) {
          const devidedLyrics = response.llmLyrics
            .replaceAll('’', "'")
            .split('\n');
          const cleanLLMLyrics = devidedLyrics
            .map((row: string) => {
              // if (
              //   row.startsWith('(') &&
              //   row.endsWith(')') &&
              //   row.includes('-') &&
              //   row !== '(Pre-Coro)' &&
              //   row !== '(Pre-Chorus)'
              // ) {
              //   if (row.includes('Pre-Coro')) {
              //     const modifier = row
              //       .split('Pre-Coro')[1]
              //       .replaceAll('(', '')
              //       .replaceAll(')', '');
              //     return `[${modifier.trimStart().trimEnd()}]\n[Pre-Coro]`;
              //   } else if (row.includes('Pre-Chorus')) {
              //     const modifier = row
              //       .split('Pre-Chorus')[1]
              //       .replaceAll('(', '')
              //       .replaceAll(')', '');
              //     return `[${modifier.trimStart().trimEnd()}]\n[Pre-Chorus]`;
              //   } else {
              //     const [type, modifier] = row
              //       .replaceAll('(', '')
              //       .replaceAll(')', '')
              //       .split('-');
              //     return `${
              //       modifier ? `(${modifier.trimStart()})\n` : ''
              //     }(${type.trim()})`;
              //   }
              // }
              return row.replaceAll('(', '[').replaceAll(')', ']');
            })
            .join('\n');
          this.llmLyrics = cleanLLMLyrics;
          this.isLoading = false;
        }
      })
      .catch(() => (this.isLoading = false))
      .finally(() => setTimeout(() => this.checkAILyricsStatus(), 5000));
  }

  public getSong(): Promise<any> {
    return new Promise((res, rej) => {
      this.status = 'downloading';

      const url = '/generate-song';
      const name = this.name.trim();
      const prompt = this.prompt;
      const llmLyrics = this.llmLyrics;
      const lyricsStyle = this.lyricsStyle.trim();
      const lyricsEmotions = this.lyricsEmotions.trim();
      const lyricsLength = this.lyricsLength;
      const songStyle = this.songStyle.trim();
      const compiledStyle = this.compiled_style;
      const llmSongStyle = this.llmSongStyle.trim();
      const model = this.model;
      const instrumental = this.instrumental;
      const songStyleBoost = this.songStyleBoost;
      const data = {
        ...(this.id && { id: this.id }),
        name,
        prompt,
        llmLyrics,
        lyricsStyle,
        songStyle,
        compiledStyle,
        llmSongStyle,
        model,
        songStyleBoost,
        instrumental,
      };
      API.Post({
        url,
        data,
        jsonapi: false,
      })
        .then((response: any) => {
          this.handleResponse(response);
          res(this.getSongToSaveInLocalStorage());
        })
        .catch((e) => {
          this.status = 'error';
          this.updateLocalStorageItem();
          rej(e);
        })
        .finally(() => setTimeout(() => this.checkStatus(), 5000));
    });
  }

  public checkStatus() {
    if (
      !this.id ||
      ((this.status === 'ready' ||
        this.status === 'canceled' ||
        this.status === 'deleted') &&
        !this.retrying)
    ) {
      return;
    }
    if (this.status === 'ready' && this.retrying) {
      this.retrying = false;
      this.updateLocalStorageItem();
      return;
    }
    API.Get({
      url: `/check-song-status/?id=${this.id}`,
      jsonapi: false,
    })
      .then((response: Song) => this.handleResponse(response))
      .catch(() => {
        if (!this.status) {
          this.status = 'downloading';
          this.updateLocalStorageItem();
        }
      })
      .finally(() => setTimeout(() => this.checkStatus(), 5000));
  }

  private updateSongArray(song: APISong) {
    const songs = [...(this.songs ?? [])].map((i: APISong) => {
      if (i.id === song.id) {
        return song;
      }
      return i;
    });
    this.songs = songs;
    system.value.songs = [...system.value.songs];
    system.value.saveSongsToLocalStorage();
  }

  private getSingleSong(songId: string): APISong | null {
    const song = this.songs.find((i) => i.id === songId);
    return song ?? null;
  }

  public getWavSong(songId: string): Promise<any> {
    return new Promise((res, rej) => {
      const song: APISong | null = this.getSingleSong(songId);
      if (!song || !this.id) {
        return rej('No song');
      }

      this.isLoading = true;
      this.updateSongArray(song);

      const url = '/generate-wav-song';
      const data = {
        id: this.id,
        songId: song.id,
      };
      API.Post({
        url,
        data,
        jsonapi: false,
      })
        .then((response: any) => {
          this.handleResponse(response);
          res(this.getSongToSaveInLocalStorage());
        })
        .catch((e) => {
          this.isLoading = false;
          rej(e);
        })
        .finally(() =>
          setTimeout(() => this.checkSingleSongStatus(songId), 5000)
        );
    });
  }

  public getVideoSong(songId: string): Promise<any> {
    return new Promise((res, rej) => {
      const song: APISong | null = this.getSingleSong(songId);
      if (!song || !this.id) {
        return rej('No song');
      }
      this.isLoading = true;
      this.updateSongArray(song);

      const url = '/generate-video-song';
      const data = {
        id: this.id,
        songId: song.id,
      };
      API.Post({
        url,
        data,
        jsonapi: false,
      })
        .then((response: any) => {
          this.handleResponse(response);
          res(this.getSongToSaveInLocalStorage());
        })
        .catch((e) => {
          this.isLoading = false;
          rej(e);
        })
        .finally(() =>
          setTimeout(() => this.checkSingleSongStatus(songId), 5000)
        );
    });
  }

  public getKaraokeSong(songId: string): Promise<any> {
    return new Promise((res, rej) => {
      const song: APISong | null = this.getSingleSong(songId);
      if (!song || !this.id) {
        return rej('No song');
      }

      this.isLoading = true;
      this.updateSongArray(song);

      const url = '/generate-karaoke-song';
      const data = {
        id: this.id,
        songId: song.id,
      };
      API.Post({
        url,
        data,
        jsonapi: false,
      })
        .then((response: any) => {
          this.handleResponse(response);
          res(this.getSongToSaveInLocalStorage());
        })
        .catch((e) => {
          this.isLoading = false;
          rej(e);
        })
        .finally(() =>
          setTimeout(() => this.checkSingleSongStatus(songId), 5000)
        );
    });
  }

  public getKaraokeVideoSong(songId: string): Promise<any> {
    return new Promise((res, rej) => {
      const song: APISong | null = this.getSingleSong(songId);
      if (!song || !this.id) {
        console.log('>> getWavSong, song ID:', songId);
        console.log('>> getWavSong, instance:', this.id);
        console.log(
          '>> getWavSong, songs:',
          this.songs.map((i) => JSON.stringify(i))
        );
        return rej('No song');
      }

      this.isLoading = true;
      this.updateSongArray(song);

      const url = '/generate-karaoke-video-song';
      const data = {
        id: this.id,
        songId: song.id,
      };
      API.Post({
        url,
        data,
        jsonapi: false,
      })
        .then((response: any) => {
          this.isLoading = false;
          this.handleResponse(response);
          res(this.getSongToSaveInLocalStorage());
        })
        .catch((e) => {
          this.isLoading = false;
          rej(e);
        })
        .finally(() => setTimeout(() => this.checkStatus(), 5000));
    });
  }

  public getPhotoVideoSong(
    songId: string,
    images: Array<string>,
    aspectRatio: 'square' | 'portrait' | 'landscape' | 'wide',
    displayLyrics: boolean
  ): Promise<any> {
    return new Promise((res, rej) => {
      const song: APISong | null = this.getSingleSong(songId);
      if (!song || !this.id) {
        return rej('No song');
      }

      this.isLoading = true;
      this.status = 'downloading';
      this.updateSongArray(song);

      const imagesPromises: Array<Promise<void>> = [];

      images.forEach((image) =>
        imagesPromises.push(
          new Promise((res, rej) => {
            const url = '/save-photo-for-song';
            const data = {
              songId: song.id,
              image,
            };
            API.Post({
              url,
              data,
              jsonapi: false,
            })
              .then(() => res())
              .catch((e) => rej(e));
          })
        )
      );

      Promise.all(imagesPromises)
        .then(() => {
          const url = '/generate-photo-video-song';
          const data = {
            id: this.id,
            songId: song.id,
            aspectRatio,
            displayLyrics,
          };
          API.Post({
            url,
            data,
            jsonapi: false,
          })
            .then((response: any) => {
              this.isLoading = false;
              this.handleResponse(response);
              res(this.getSongToSaveInLocalStorage());
            })
            .catch((e) => {
              this.isLoading = false;
              this.status = 'ready';
              this.updateSongArray(song);
              console.log('Error creating video song:', e);
              rej(e);
            })
            .finally(() => setTimeout(() => this.checkStatus(), 5000));
        })
        .catch((e) => {
          this.isLoading = false;
          this.status = 'ready';
          this.updateSongArray(song);
          console.log('Error saving images:', e);
          rej(e);
        });
    });
  }

  public deleteSong(): Promise<any> {
    return new Promise((res, rej) => {
      if (!this.id) {
        return rej('No song');
      }
      this.isLoading = true;

      const url = `/delete-song/?id=${this.id}`;
      API.Delete({
        url,
        jsonapi: false,
      })
        .then(() => {
          this.status = 'downloading';
          res(this.checkStatus());
        })
        .catch((e) => alert(`error ${e}`))
        .finally(() => (this.isLoading = false));
    });
  }

  public deleteSingleSong(songId: string): Promise<any> {
    return new Promise((res, rej) => {
      const song: APISong | null = this.getSingleSong(songId);
      if (!song || !this.id) {
        return rej('No song');
      }
      this.isLoading = true;
      this.updateSongArray(song);

      const url = `/delete-single-song/?id=${this.id}&songId=${songId}`;
      API.Delete({
        url,
        jsonapi: false,
      })
        .then(() => {
          this.status = 'downloading';
          res(this.checkStatus());
        })
        .catch((e) => alert(`error ${e}`))
        .finally(() => (this.isLoading = false));
    });
  }

  public cancelItem(): Promise<any> {
    return new Promise((res, rej) => {
      if (!this.id) {
        return rej('No song');
      }
      this.isLoading = false;
      API.Get({
        url: `/cancel-item/?id=${this.id}`,
        jsonapi: false,
      })
        .then((response: any) => {
          this.isLoading = false;
          this.handleResponse(response);
          res(this.getSongToSaveInLocalStorage());
        })
        .catch((e) => rej(e))
        .finally(() => (this.isLoading = false));
    });
  }

  public checkSingleSongStatus(songId: string) {
    const song = this.getSingleSong(songId);
    if (
      !song ||
      !this.id ||
      song.status === 'ready' ||
      song.status === 'canceled' ||
      song.status === 'deleted'
    ) {
      return;
    }
    API.Get({
      url: `/check-song-status/?id=${this.id}`,
      jsonapi: false,
    })
      .then((response: Song) => this.handleResponse(response))
      .catch((e) => console.log('error', e))
      .finally(() => {
        if (this.isLoading) {
          this.isLoading = false;
          this.updateSongArray(song);
        }
        setTimeout(() => this.checkSingleSongStatus(songId), 5000);
      });
  }

  public updateLocalStorageItem() {
    const items: Array<any> = this.getSongsFromLocalStorage();
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === this.id || items[i].taskID === this.taskID) {
        items[i] = this.getSongToSaveInLocalStorage();
      }
    }
    SetLocalStorageData('songs', JSON.stringify(items));
  }

  public getSongsFromLocalStorage(): Array<Song> {
    let cachedItems: any = GetLocalStorageData('songs');
    if (cachedItems) {
      cachedItems = (JSON.parse(cachedItems) as Array<any>) ?? [];
      return cachedItems;
    }
    return [];
  }

  public getSongToSaveInLocalStorage() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      songs: this.songs,
      prompt: this.prompt,
      negativePrompt: this.negativePrompt,
      lyricsStyle: this.lyricsStyle,
      lyricsEmotions: this.lyricsEmotions,
      lyricsLength: this.lyricsLength,
      songStyle: this.songStyle,
      compiledStyle: this.compiled_style,
      llmSongStyle: this.llmSongStyle,
      llmLyrics: this.llmLyrics,
      songStyleBoost: this.songStyleBoost,
      instrumental: this.instrumental,
      taskID: this.taskID,
      model: this.model,
      retrying: this.retrying,

      rock: this.rock ?? false,
      pop: this.pop ?? false,
      electronic: this.electronic ?? false,
      metal: this.metal ?? false,
      country: this.country ?? false,
      mariachi: this.mariachi ?? false,
      ballad: this.ballad ?? false,
      jazz: this.jazz ?? false,
      prehispanic: this.prehispanic ?? false,
      tropical: this.tropical ?? false,
      cumbia: this.cumbia ?? false,
      salsa: this.salsa ?? false,
      trio: this.trio ?? false,
      trap: this.trap ?? false,
      merengue: this.merengue ?? false,
      mambo: this.mambo ?? false,
      ranchera: this.ranchera ?? false,
      mexican_regional: this.mexican_regional ?? false,
      corrido: this.corrido ?? false,
      norteno: this.norteno ?? false,
      tribal: this.tribal ?? false,
      sinaloa_band: this.sinaloa_band ?? false,
      bachata: this.bachata ?? false,
      reggaeton: this.reggaeton ?? false,
      reggae: this.reggae ?? false,
      urban: this.urban ?? false,
      k_pop: this.k_pop ?? false,
      hip_hop: this.hip_hop ?? false,
      rap: this.rap ?? false,
      blues: this.blues ?? false,
      ska: this.ska ?? false,
      indie: this.indie ?? false,
      acoustic: this.acoustic ?? false,
      rb: this.rb ?? false,

      happyness: this.happyness ?? false,
      joy: this.joy ?? false,
      love: this.love ?? false,
      sadness: this.sadness ?? false,
      proud: this.proud ?? false,
      romantic: this.romantic ?? false,
      nostalgic: this.nostalgic ?? false,
      spite: this.spite ?? false,
      angry: this.angry ?? false,
      melodic: this.melodic ?? false,
      emotional: this.emotional ?? false,
      clean_rhythm: this.clean_rhythm ?? false,
      melodic_chorus: this.melodic_chorus ?? false,

      piano: this.piano ?? false,
      guitar: this.guitar ?? false,
      electric_guitar: this.electric_guitar ?? false,
      requinto: this.requinto ?? false,
      bass: this.bass ?? false,
      trompets: this.trompets ?? false,
      violin: this.violin ?? false,
      accordion: this.accordion ?? false,
      saxophone: this.saxophone ?? false,
      synthesizer: this.synthesizer ?? false,
      drums: this.drums ?? false,
      hardDrums: this.hardDrums ?? false,

      voices: this.voices,
    };
  }

  public deleteVoice(id: number) {
    const tmp = [...this.voices];
    tmp.splice(id, 1);
    this.voices = tmp;
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

  public get name() {
    return this._name.value;
  }
  public set name(value) {
    this._name.value = value;
  }

  public get status() {
    return this._status.value;
  }
  public set status(value) {
    this._status.value = value;
  }

  public get retrying() {
    return this._retrying.value;
  }
  public set retrying(value) {
    this._retrying.value = value;
  }

  public get llmErrorCode() {
    return this._llmErrorCode.value;
  }
  public set llmErrorCode(value) {
    this._llmErrorCode.value = value;
  }

  public get singleSongSelected() {
    return this._singleSongSelected.value;
  }
  public set singleSongSelected(value) {
    this._singleSongSelected.value = value;
  }

  public get songs() {
    return this._songs.value;
  }
  public set songs(value) {
    this._songs.value = value;
  }

  public get prompt() {
    return this._prompt.value;
  }
  public set prompt(value) {
    this._prompt.value = value;
  }

  public get negativePrompt() {
    return this._negativePrompt.value;
  }
  public set negativePrompt(value) {
    this._negativePrompt.value = value;
  }

  public get lyricsStyle() {
    return this._lyricsStyle.value;
  }
  public set lyricsStyle(value) {
    this._lyricsStyle.value = value;
  }

  public get lyricsLength() {
    return this._lyricsLength.value;
  }
  public set lyricsLength(value) {
    this._lyricsLength.value = value;
  }

  public get lyricsEmotions() {
    return this._lyricsEmotions.value;
  }
  public set lyricsEmotions(value) {
    this._lyricsEmotions.value = value;
  }

  public get songStyle() {
    return this._songStyle.value;
  }
  public set songStyle(value) {
    this._songStyle.value = value;
  }

  public get llmSongStyle() {
    return this._llmSongStyle.value;
  }
  public set llmSongStyle(value) {
    this._llmSongStyle.value = value;
  }

  public get llmLyrics() {
    return this._llmLyrics.value;
  }
  public set llmLyrics(value) {
    this._llmLyrics.value = value;
  }

  public get taskID() {
    return this._taskID.value;
  }
  public set taskID(value) {
    this._taskID.value = value;
  }

  public get songReference() {
    return this._songReference.value;
  }
  public set songReference(value) {
    this._songReference.value = value;
  }

  public get songStyleBoost() {
    return this._songStyleBoost.value;
  }
  public set songStyleBoost(value) {
    this._songStyleBoost.value = value;
  }

  public get instrumental() {
    return this._instrumental.value;
  }
  public set instrumental(value) {
    this._instrumental.value = value;
  }

  public get model() {
    return this._model.value;
  }
  public set model(value) {
    this._model.value = value;
  }

  public get isLoading() {
    return this._isLoading.value;
  }
  public set isLoading(value) {
    this._isLoading.value = value;
  }

  public get language() {
    return this._language.value;
  }
  public set language(value) {
    this._language.value = value;
  }

  // Styles
  public get rock() {
    return this._rock.value;
  }
  public set rock(value) {
    this._rock.value = value;
  }

  public get pop() {
    return this._pop.value;
  }
  public set pop(value) {
    this._pop.value = value;
  }

  public get electronic() {
    return this._electronic.value;
  }
  public set electronic(value) {
    this._electronic.value = value;
  }

  public get metal() {
    return this._metal.value;
  }
  public set metal(value) {
    this._metal.value = value;
  }

  public get country() {
    return this._country.value;
  }
  public set country(value) {
    this._country.value = value;
  }

  public get mariachi() {
    return this._mariachi.value;
  }
  public set mariachi(value) {
    this._mariachi.value = value;
  }

  public get ballad() {
    return this._ballad.value;
  }
  public set ballad(value) {
    this._ballad.value = value;
  }

  public get jazz() {
    return this._jazz.value;
  }
  public set jazz(value) {
    this._jazz.value = value;
  }

  public get prehispanic() {
    return this._prehispanic.value;
  }
  public set prehispanic(value) {
    this._prehispanic.value = value;
  }

  public get tropical() {
    return this._tropical.value;
  }
  public set tropical(value) {
    this._tropical.value = value;
  }

  public get cumbia() {
    return this._cumbia.value;
  }
  public set cumbia(value) {
    this._cumbia.value = value;
  }

  public get salsa() {
    return this._salsa.value;
  }
  public set salsa(value) {
    this._salsa.value = value;
  }

  public get trio() {
    return this._trio.value;
  }
  public set trio(value) {
    this._trio.value = value;
  }

  public get trap() {
    return this._trap.value;
  }
  public set trap(value) {
    this._trap.value = value;
  }

  public get merengue() {
    return this._merengue.value;
  }
  public set merengue(value) {
    this._merengue.value = value;
  }

  public get mambo() {
    return this._mambo.value;
  }
  public set mambo(value) {
    this._mambo.value = value;
  }

  public get ranchera() {
    return this._ranchera.value;
  }
  public set ranchera(value) {
    this._ranchera.value = value;
  }

  public get mexican_regional() {
    return this._mexican_regional.value;
  }
  public set mexican_regional(value) {
    this._mexican_regional.value = value;
  }

  public get corrido() {
    return this._corrido.value;
  }
  public set corrido(value) {
    this._corrido.value = value;
  }

  public get norteno() {
    return this._norteno.value;
  }
  public set norteno(value) {
    this._norteno.value = value;
  }

  public get tribal() {
    return this._tribal.value;
  }
  public set tribal(value) {
    this._tribal.value = value;
  }

  public get sinaloa_band() {
    return this._sinaloa_band.value;
  }
  public set sinaloa_band(value) {
    this._sinaloa_band.value = value;
  }

  public get bachata() {
    return this._bachata.value;
  }
  public set bachata(value) {
    this._bachata.value = value;
  }

  public get reggaeton() {
    return this._reggaeton.value;
  }
  public set reggaeton(value) {
    this._reggaeton.value = value;
  }

  public get reggae() {
    return this._reggae.value;
  }
  public set reggae(value) {
    this._reggae.value = value;
  }

  public get urban() {
    return this._urban.value;
  }
  public set urban(value) {
    this._urban.value = value;
  }

  public get k_pop() {
    return this._k_pop.value;
  }
  public set k_pop(value) {
    this._k_pop.value = value;
  }

  public get hip_hop() {
    return this._hip_hop.value;
  }
  public set hip_hop(value) {
    this._hip_hop.value = value;
  }

  public get rap() {
    return this._rap.value;
  }
  public set rap(value) {
    this._rap.value = value;
  }

  public get blues() {
    return this._blues.value;
  }
  public set blues(value) {
    this._blues.value = value;
  }

  public get ska() {
    return this._ska.value;
  }
  public set ska(value) {
    this._ska.value = value;
  }

  public get indie() {
    return this._indie.value;
  }
  public set indie(value) {
    this._indie.value = value;
  }

  public get acoustic() {
    return this._acoustic.value;
  }
  public set acoustic(value) {
    this._acoustic.value = value;
  }

  public get rb() {
    return this._rb.value;
  }
  public set rb(value) {
    this._rb.value = value;
  }

  // Emotions

  public get happyness() {
    return this._happyness.value;
  }
  public set happyness(value) {
    this._happyness.value = value;
  }

  public get joy() {
    return this._joy.value;
  }
  public set joy(value) {
    this._joy.value = value;
  }

  public get love() {
    return this._love.value;
  }
  public set love(value) {
    this._love.value = value;
  }

  public get sadness() {
    return this._sadness.value;
  }
  public set sadness(value) {
    this._sadness.value = value;
  }

  public get proud() {
    return this._proud.value;
  }
  public set proud(value) {
    this._proud.value = value;
  }

  public get romantic() {
    return this._romantic.value;
  }
  public set romantic(value) {
    this._romantic.value = value;
  }

  public get nostalgic() {
    return this._nostalgic.value;
  }
  public set nostalgic(value) {
    this._nostalgic.value = value;
  }

  public get spite() {
    return this._spite.value;
  }
  public set spite(value) {
    this._spite.value = value;
  }

  public get angry() {
    return this._angry.value;
  }
  public set angry(value) {
    this._angry.value = value;
  }

  public get melodic() {
    return this._melodic.value;
  }
  public set melodic(value) {
    this._melodic.value = value;
  }

  public get modern() {
    return this._modern.value;
  }
  public set modern(value) {
    this._modern.value = value;
  }

  public get emotional() {
    return this._emotional.value;
  }
  public set emotional(value) {
    this._emotional.value = value;
  }

  public get clean_rhythm() {
    return this._clean_rhythm.value;
  }
  public set clean_rhythm(value) {
    this._clean_rhythm.value = value;
  }

  public get melodic_chorus() {
    return this._melodic_chorus.value;
  }
  public set melodic_chorus(value) {
    this._melodic_chorus.value = value;
  }

  // Instruments

  public get piano() {
    return this._piano.value;
  }
  public set piano(value) {
    this._piano.value = value;
  }

  public get guitar() {
    return this._guitar.value;
  }
  public set guitar(value) {
    this._guitar.value = value;
  }

  public get electric_guitar() {
    return this._electric_guitar.value;
  }
  public set electric_guitar(value) {
    this._electric_guitar.value = value;
  }

  public get clean_guitars() {
    return this._clean_guitars.value;
  }
  public set clean_guitars(value) {
    this._clean_guitars.value = value;
  }

  public get requinto() {
    return this._requinto.value;
  }
  public set requinto(value) {
    this._requinto.value = value;
  }

  public get bass() {
    return this._bass.value;
  }
  public set bass(value) {
    this._bass.value = value;
  }

  public get trompets() {
    return this._trompets.value;
  }
  public set trompets(value) {
    this._trompets.value = value;
  }

  public get violin() {
    return this._violin.value;
  }
  public set violin(value) {
    this._violin.value = value;
  }

  public get accordion() {
    return this._accordion.value;
  }
  public set accordion(value) {
    this._accordion.value = value;
  }

  public get saxophone() {
    return this._saxophone.value;
  }
  public set saxophone(value) {
    this._saxophone.value = value;
  }

  public get synthesizer() {
    return this._synthesizer.value;
  }
  public set synthesizer(value) {
    this._synthesizer.value = value;
  }

  public get drums() {
    return this._drums.value;
  }
  public set drums(value) {
    this._drums.value = value;
  }

  public get hardDrums() {
    return this._hardDrums.value;
  }
  public set hardDrums(value) {
    this._hardDrums.value = value;
  }

  // Voices
  public get voices() {
    return this._voices.value;
  }
  public set voices(value) {
    this._voices.value = value;
  }

  public get voice_type() {
    return this._voice_type.value;
  }
  public set voice_type(value) {
    this._voice_type.value = value;
  }

  public get voice_style() {
    return this._voice_style.value;
  }
  public set voice_style(value) {
    this._voice_style.value = value;
  }

  public get vocalStyle() {
    return this._vocalStyle.value;
  }
  public set vocalStyle(value) {
    this._vocalStyle.value = value;
  }

  public get duo() {
    return this._duo.value;
  }
  public set duo(value) {
    this._duo.value = value;
  }

  public get compiled_style(): string {
    let compiled = '';
    const styles: Array<string> = [];
    if (this.rock) styles.push('Rock');
    if (this.pop) styles.push('Pop');
    if (this.electronic) styles.push('Electronic');
    if (this.metal) styles.push('Metal');
    if (this.country) styles.push('Country');
    if (this.mariachi) styles.push('Mariachi');
    if (this.ballad) styles.push('Balada');
    if (this.jazz) styles.push('Jazz');
    if (this.prehispanic) styles.push('Prehispanico');
    if (this.tropical) styles.push('Tropical');
    if (this.cumbia) styles.push('Cumbia');
    if (this.salsa) styles.push('Salsa');
    if (this.trio) styles.push('Trio');
    if (this.trap) styles.push('Trap');
    if (this.merengue) styles.push('Merengue');
    if (this.mambo) styles.push('Mambo');
    if (this.ranchera) styles.push('Ranchera');
    if (this.mexican_regional) styles.push('Mexican regional');
    if (this.corrido) styles.push('Corrido norteño');
    if (this.norteno) styles.push('Música norteña');
    if (this.tribal) styles.push('Tribal norteño');
    if (this.sinaloa_band) styles.push('Banda Sinaloense');
    if (this.bachata) styles.push('Bachata');
    if (this.reggaeton) styles.push('Reggaeton');
    if (this.reggae) styles.push('Reggae');
    if (this.urban) styles.push('Urban');
    if (this.k_pop) styles.push('K-Pop');
    if (this.hip_hop) styles.push('Hip-Hop');
    if (this.rap) styles.push('Rap');
    if (this.blues) styles.push('Blues');
    if (this.ska) styles.push('Ska');
    if (this.indie) styles.push('Indie');
    if (this.acoustic) styles.push('Acoustic');
    if (this.rb) styles.push('R&B');

    if (styles.length) {
      compiled += `Rhythm${styles.length !== 1 ? 's' : ''}: `;
      compiled += styles.join(', ') + '. ';
    }

    const emotions: Array<string> = [];
    if (this.happyness) emotions.push('Happyness');
    if (this.joy) emotions.push('Joy');
    if (this.love) emotions.push('Love');
    if (this.sadness) emotions.push('Sadness');
    if (this.proud) emotions.push('Proud');
    if (this.romantic) emotions.push('Romantic');
    if (this.nostalgic) emotions.push('Nostalgic');
    if (this.spite) emotions.push('Spite');
    if (this.angry) emotions.push('Angry');
    if (this.melodic) emotions.push('Melodic');
    if (this.modern) emotions.push('Modern');
    if (this.emotional) emotions.push('Emotional');
    if (this.clean_rhythm) emotions.push('Clean rhythm');
    if (this.melodic_chorus) emotions.push('Melodic chorus');

    if (emotions.length) {
      compiled += `Emotion${emotions.length !== 1 ? 's' : ''}: `;
      compiled += emotions.join(', ') + '. ';
    }

    const instruments: Array<string> = [];
    if (this.piano) instruments.push('Piano');
    if (this.guitar) instruments.push('Guitars');
    if (this.electric_guitar) instruments.push('Electric guitars');
    if (this.clean_guitars) instruments.push('Clean guitars');
    if (this.requinto) instruments.push('Requinto guitar');
    if (this.bass) instruments.push('Bass');
    if (this.trompets) instruments.push('Trompets');
    if (this.violin) instruments.push('Violin');
    if (this.accordion) instruments.push('Accordion');
    if (this.saxophone) instruments.push('Saxophone');
    if (this.synthesizer) instruments.push('Synthesizer');
    if (this.drums) instruments.push('Drums');
    if (this.hardDrums) instruments.push('Hard Drums');

    if (instruments.length) {
      compiled += `Instrument${instruments.length !== 1 ? 's' : ''}: `;
      compiled += instruments.join(', ') + '. ';
    }

    if (this.voices.length) {
      compiled += `Vocal${this.voices.length !== 1 ? 's' : ''}: `;
      compiled +=
        this.voices
          .map((i) => {
            const [typeAndStyle, VocalStyle] = i.split('/');
            const [type, style] = typeAndStyle.split('-');
            const vocal = `${style ? `${style} ` : ''} ${type} ${
              VocalStyle ? `${VocalStyle} ` : ''
            }Vocals`;
            return vocal;
          })
          .join(', ') + '. ';
      if (this.duo) {
        compiled += ' Duo.';
      }
    }

    return compiled;
  }
}

export const item = signal<Song>(Song.getInstance()).value;
