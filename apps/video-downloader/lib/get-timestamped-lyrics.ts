import API from '@repo/helpers/api/index';
import Song, { APISong, TimestampedLyrics } from '@/types/song';
import { getSong, updateSong } from './song';

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

type APIResponse = {
  code: number; // 200
  msg: string; // success
  data: {
    alignedWords: TimestampedLyrics;
  };
};

type Parameters = {
  id: string;
  songId: string;
};

const GetTimeStampedLyrics = ({ id, songId }: Parameters): Promise<Song> => {
  return new Promise((res, rej) => {
    getSong({ id }).then((i: Song | null) => {
      if (!i) {
        return rej('Error, song not found');
      }
      // console.log('GetTimeStampedLyrics(item):', i.name, ', status:', i.status);
      const item = { ...i };
      const sunaAPI = process.env.SUNA_API_KEY ?? '';

      const song: APISong | null = getSingleSong(item, songId);
      if (!song || !song.id) {
        console.log('Error, no song!');
        return rej('Error, song not found');
      }

      if (song.timestampedLyrics) {
        return res(item);
      }

      const url =
        'https://api.sunoapi.org/api/v1/generate/get-timestamped-lyrics';
      const data = {
        taskId: song.taskID ?? item.taskID,
        audioId: song.id,
        callBackUrl: 'https://vd.iguzman.com.mx/callback',
      };

      console.log('>> GetTimeStampedLyrics request data:', data);

      API.Post({
        url,
        data,
        jwt: sunaAPI,
        jsonapi: false,
      })
        .then((response: APIResponse) => {
          console.log(
            'Response, GetTimeStampedLyrics:',
            JSON.stringify(response)
          );
          song.timestampedLyrics = response.data.alignedWords;
          updateSong(updateSongArray(item, song))
            .then((updated: Song) => res(updated))
            .catch((error) => rej(error));
        })
        .catch((e) => {
          console.log('Error, GetTimeStampedLyrics:', JSON.stringify(e));
          rej(e);
        });
    });
  });
};

export default GetTimeStampedLyrics;
