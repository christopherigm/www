import API from '@repo/helpers/api/index';
import Song, { APISong } from '@/types/song';
import { getSong, updateSong } from './song';
import { exec } from 'child_process';
import { mediaPath } from '@/config';

type StatusAPIResponse = {
  code: number; // 200
  msg: string; // success
  data: {
    taskId: string; // d1559d3 ...
    musicId: string; // abcde ...
    successFlag: string; // PENDING - SUCCESS
    errorCode?: number | null;
    errorMessage?: string | null;
    response?: {
      audioWavUrl: string; // http://
    };
  };
};

const updateSongArray = (item: Song, song: APISong): Song => {
  const songs = [...(item.songs ?? [])].map((i: APISong) => {
    if (i.id === song.id) {
      return song;
    }
    return i;
  });
  item.songs = songs;
  return item;
};

const getSingleSong = (item: Song, songId: string): APISong | null => {
  if (item.songs) {
    const song = item.songs.find((i) => i.id === songId);
    return song ?? null;
  }
  return null;
};

export const APICheck = (item: Song, songId: string) => {
  console.log('>>> APICheck:', item.id, '>', item.name, '> songId:', songId);
  const sunaAPI = process.env.SUNA_API_KEY ?? '';
  const song: APISong | null = getSingleSong(item, songId);
  if (!song) {
    console.log('>>> No Song! returning!');
    return;
  }

  const sunaAPIURL = `https://api.sunoapi.org/api/v1/wav/record-info?taskId=${song.audioWavTaskId}`;
  return API.Get({
    url: sunaAPIURL,
    jwt: sunaAPI,
    jsonapi: false,
  })
    .then((response: StatusAPIResponse) => {
      if (response.data) {
        if (response.data.successFlag) {
          song.status =
            response.data.successFlag === 'SUCCESS'
              ? 'ready'
              : response.data.successFlag === 'CREATE_TASK_FAILED' ||
                  response.data.successFlag === 'GENERATE_AUDIO_FAILED' ||
                  response.data.successFlag === 'CALLBACK_EXCEPTION' ||
                  response.data.successFlag === 'SENSITIVE_WORD_ERROR'
                ? 'error'
                : 'downloading';
          if (response.data.errorCode) {
            console.log('>>> Suno WAV API Error:', response.data.errorCode);
          }
        }
      }
      if (response.code === 400) {
        song.status = 'wav-deleted';
      }

      if (
        song.status === 'ready' &&
        response.data.response &&
        response.data.response.audioWavUrl
      ) {
        console.log('>>> Suno API code:', response.code);
        console.log('>>> Suno API data:', response.data.successFlag);
        item.status = 'ready';
        song.audioWavUrl = response.data.response.audioWavUrl;
        const appUrl = `ai-music/${item.name}-${song.id}.wav`;
        let command = `wget ${song.audioWavUrl} `;
        command += `-O "${mediaPath}/${appUrl}"`;
        exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
          if (error) {
            console.log('exec error getting wav:', error);
          }
          song.audioWavUrl = appUrl;
          updateSong(updateSongArray(item, song)).catch((e) =>
            console.log('Error updateSong filesPromises:', e)
          );
        });
      } else if (response.code !== 200) {
        console.log('>>> Suno WAV API error:', response);
        console.log('>>> Implement rety mechanism');
        // console.log('>>> Suno API item:', item);
        updateSong(updateSongArray(item, song))
          .then(() => setTimeout(() => APICheck(item, songId), 5000))
          .catch((e) => console.log('Error updateSong retrying:', e));
      } else {
        updateSong(updateSongArray(item, song))
          .then(() => setTimeout(() => APICheck(item, songId), 5000))
          .catch((e) => console.log('Error updateSong retrying:', e));
      }
    })
    .catch(() => setTimeout(() => APICheck(item, songId), 5000));
};

type APIResponse = {
  code: number; // 200
  msg: string; // success
  data: {
    taskId: string; // d1559d3 ...
  };
};

type Parameters = {
  id: string;
  songId: string;
};

const getWavSong = ({ id, songId }: Parameters): Promise<Song> => {
  return new Promise(async (res, rej) => {
    getSong({ id })
      .then((i: Song | null) => {
        if (!i) {
          return rej('Error, song not found');
        }
        console.log('getSong(item):', i.name, ', status:', i.status);
        const item = { ...i };
        const sunaAPI = process.env.SUNA_API_KEY ?? '';
        const url = 'https://api.sunoapi.org/api/v1/wav/generate';

        if (item.status !== 'ready') {
          return rej('Error, song not ready');
        }

        const song: APISong | null = getSingleSong(item, songId);
        if (!song || !song.id) {
          return rej('Error, song not found');
        }

        const data = {
          taskId: song.taskID ?? item.taskID,
          audioId: song.id,
          callBackUrl: 'https://vd.iguzman.com.mx/callback',
        };
        API.Post({
          url,
          data,
          jwt: sunaAPI,
          jsonapi: false,
        })
          .then((response: APIResponse) => {
            if (response.code >= 400) {
              console.log('Suno API Error (item):', item);
              console.log('Suno API Error (response):', response);
            }
            song.status =
              response.code === 200
                ? 'downloading'
                : response.code === 455
                  ? 'maintenance'
                  : 'error';
            item.status =
              response.code === 200
                ? 'downloading'
                : response.code === 455
                  ? 'maintenance'
                  : 'error';
            if (response.data && response.data.taskId) {
              song.audioWavTaskId = response.data.taskId;
            }
            updateSong(updateSongArray(item, song))
              .then((updated: Song) => res(updated))
              .catch((error) => rej(error))
              .finally(() => APICheck(updateSongArray(item, song), songId));
          })
          .catch((error) => rej(error));
      })
      .catch((error) => rej(error));
  });
};

export default getWavSong;
