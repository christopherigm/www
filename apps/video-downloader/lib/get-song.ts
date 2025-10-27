import API from '@repo/helpers/api/index';
import Song, { APISong } from '@/types/song';
import { getOrCreateSong, updateSong } from './song';
import { exec } from 'child_process';
import { mediaPath } from '@/config';

type StatusAPIResponse = {
  code: number; // 200
  msg: string; // success
  data: {
    taskId: string; // d1559d3 ...
    status: string; // PENDING - SUCCESS
    param?: string; // chirp-v4
    type?: string; // chirp-v4
    errorCode?: number | null;
    errorMessage?: string | null;
    response?: {
      taskId: string; // d1559d3 ...
      sunoData: Array<APISong>;
    };
  };
};

export const APICheck = (item: Song) => {
  const sunaAPI = process.env.SUNA_API_KEY ?? '';
  const sunaAPIURL = `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${item.taskID}`;
  return API.Get({
    url: sunaAPIURL,
    jwt: sunaAPI,
    jsonapi: false,
  })
    .then((response: StatusAPIResponse) => {
      // console.log('>>> Suno API data:', response);
      if (response.data) {
        if (response.data.status) {
          item.status =
            response.data.status === 'SUCCESS'
              ? 'ready'
              : response.data.status === 'CREATE_TASK_FAILED' ||
                  response.data.status === 'GENERATE_AUDIO_FAILED' ||
                  response.data.status === 'CALLBACK_EXCEPTION' ||
                  response.data.status === 'SENSITIVE_WORD_ERROR'
                ? 'error'
                : 'downloading';
          item.llmStatus = response.data.status;
          if (response.data.errorCode) {
            item.llmErrorCode = response.data.errorCode;
          }
        }
      }
      if (response.code === 200 && response.data === null) {
        item.retrying = false;
        item.status = 'deleted';
      }
      if (response.code === 413) {
        item.retrying = false;
        item.status = 'deleted';
      }
      if (
        item.status === 'ready' &&
        response.data.response &&
        response.data.response.sunoData
      ) {
        console.log('>>> Suno API code:', response.code);
        console.log('>>> Suno API data:', response.data.status);
        const songs = item.songs ?? [];
        item.songs = songs.concat(response.data.response.sunoData);
        const filesPromises: Array<Promise<void>> = [];
        item.retrying = false;
        item.songs = item.songs.map((v) => {
          if (v.appUrl && v.appImageUrl) {
            return v;
          }
          const appUrl = `ai-music/${item.name}-${v.id}.mp3`;
          filesPromises.push(
            new Promise((res, rej) => {
              let command = `wget ${v.sourceAudioUrl} `;
              command += `-O "${mediaPath}/${appUrl}"`;
              exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
                if (error) {
                  console.log('exec error audio:', error);
                  return rej(error);
                }
                v.appUrl = appUrl;
                return res();
              });
            })
          );
          const appImageUrl = `ai-music/${item.name}-${v.id}.jpeg`;
          filesPromises.push(
            new Promise((res, rej) => {
              let command = `wget ${v.imageUrl} `;
              command += `-O "${mediaPath}/${appImageUrl}"`;
              exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
                if (error) {
                  console.log('exec error image:', error);
                  return rej(error);
                }
                v.appImageUrl = appImageUrl;
                return res();
              });
            })
          );
          v.taskID = item.taskID ?? '';
          return v;
        });
        Promise.all(filesPromises)
          .finally(() => {
            return updateSong(item).catch((e) =>
              console.log('Error updateSong filesPromises:', e)
            );
          })
          .catch((e) => console.log('Error filesPromises:', e));
      } else if (item.status === 'error') {
        console.log('>>> Suno API error:', response);
        // console.log('>>> Suno API item:', item);
        if (response.data && response.data.errorCode) {
          item.llmErrorCode = response.data.errorCode;
        }
        if (
          item.id &&
          response.data.status !== 'SENSITIVE_WORD_ERROR' &&
          response.data.errorCode !== 413
        ) {
          item.retrying = true;
          updateSong(item)
            .then(() =>
              getSong({
                ...item,
                id: item.id ?? '',
                name: item.name ?? '',
              }).catch((e) =>
                console.log('Error when automatically retrying:', e)
              )
            )
            .catch((e) => console.log('Error updateSong retrying:', e));
        } else if (
          response.data.status === 'SENSITIVE_WORD_ERROR' ||
          response.data.errorCode === 413 ||
          response.data.errorMessage === 'Does Not Meet Guidelines'
        ) {
          item.status = 'deleted';
          item.retrying = false;
          updateSong(item).catch((e) =>
            console.log('Error updateSong error deleted:', e)
          );
        }
      } else {
        updateSong(item)
          .then(() => setTimeout(() => APICheck(item), 5000))
          .catch((e) => console.log('Error updateSong retrying:', e));
      }
    })
    .catch(() => setTimeout(() => APICheck(item), 5000));
};

type SongStyleResponse = {
  code: number; // 200
  msg: string; // success
  data: {
    taskId: string; // d1559d3 ...
    result: string;
  };
};

type APIResponse = {
  code: number; // 200
  msg: string; // success
  data: {
    taskId: string; // d1559d3 ...
    status: string; // PENDING - SUCCESS
    param?: string; // chirp-v4
    type?: string; // chirp-v4
    errorCode?: number | null;
    errorMessage?: string | null;
  };
};

type Parameters = {
  id?: string;
  name: string;
  prompt?: string;
  llmLyrics?: string;
  lyricsStyle?: string;
  songStyle?: string;
  compiledStyle?: string;
  llmSongStyle?: string;
  model?: string;
  songStyleBoost?: boolean;
  instrumental?: boolean;
};

const getSong = ({
  id,
  name,
  prompt,
  llmLyrics,
  lyricsStyle,
  songStyle,
  compiledStyle,
  llmSongStyle,
  model = 'V5',
  songStyleBoost = false,
  instrumental = false,
}: Parameters): Promise<Song> => {
  return new Promise((res, rej) => {
    if (llmLyrics === undefined || llmLyrics === '') {
      console.log(
        'Error getSong:',
        '\n Name:',
        name,
        '\n prompt:',
        prompt,
        '\n llmLyrics:',
        llmLyrics,
        '\n lyricsStyle:',
        lyricsStyle,
        '\n songStyle:',
        songStyle,
        '\n compiledStyle:',
        compiledStyle,

        '\n llmSongStyle:',
        llmSongStyle,
        '\n model:',
        model
      );
      return rej('error');
    }

    const promise = id
      ? getOrCreateSong({ id }).then((item: Song) =>
          updateSong({
            ...item,
            id,
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
          })
        )
      : getOrCreateSong({
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
        });
    promise
      .then((i: Song) => {
        console.log(
          'getSong(item):',
          i.name,
          ', status:',
          i.status,
          ', retrying:',
          i.retrying,
          ', songs:',
          i.songs?.length
        );

        const item = { ...i };
        const sunaAPI = process.env.SUNA_API_KEY ?? '';

        // Compiled Style + Song Style
        const songStyle = (item.compiledStyle ?? '') + ' ' + item.songStyle;

        const promises: Array<Promise<string>> = [];
        if (songStyle && songStyleBoost && !item.llmSongStyle) {
          promises.push(
            new Promise((res, rej) => {
              API.Post({
                url: 'https://api.sunoapi.org/api/v1/style/generate',
                data: {
                  content: songStyle,
                },
                jwt: sunaAPI,
                jsonapi: false,
              })
                .then((response: SongStyleResponse) =>
                  res(response.data?.result ?? songStyle)
                )
                .catch((error) => rej(error));
            })
          );
        }

        Promise.all(promises)
          .then((styles: Array<string>) => {
            const url = 'https://api.sunoapi.org/api/v1/generate';
            if (styles && styles.length && styles[0]) {
              // Set boost only when we get the boosted style.
              item.songStyleBoost = songStyleBoost;
              item.llmSongStyle = styles[0];
            }
            const data = {
              prompt: item.llmLyrics,
              title: item.name,
              style: item.llmSongStyle ?? songStyle,
              customMode: true,
              instrumental: item.instrumental,
              model: item.model,
              callBackUrl: 'http://vd.iguzman.com.mx/callback',
            };
            API.Post({
              url,
              data,
              jwt: sunaAPI,
              jsonapi: false,
            })
              .then((response: APIResponse) => {
                const newItem = { ...item };
                if (response.code >= 400) {
                  console.log('Suno API Error (item):', item);
                  console.log('Suno API Error (response):', response);
                }
                newItem.status =
                  response.code === 200
                    ? 'downloading'
                    : response.code === 455
                      ? 'maintenance'
                      : 'error';
                if (response.data && response.data.taskId) {
                  newItem.taskID = response.data.taskId;
                }
                updateSong(newItem)
                  .then((updated: Song) => res(updated))
                  .catch((error) => rej(error))
                  .finally(() => APICheck(newItem));
              })
              .catch((error) => rej(error));
          })
          .catch((error) => rej(error));
      })
      .catch((error) => rej(error));
  });
};

export default getSong;
