import Song, { APISong } from '@/types/song';
import { getSong, updateSong } from './song';
import { exec } from 'child_process';
import { mediaPath } from '@/config';

const getSingleSong = (item: Song, songId: string): APISong | null => {
  if (item.songs) {
    const song = item.songs.find((i) => i.id === songId);
    return song ?? null;
  }
  return null;
};

type Parameters = {
  id: string;
  songId: string;
};

const deleteSingleSong = ({ id, songId }: Parameters): Promise<Song> => {
  return new Promise(async (res, rej) => {
    console.log('>>> deleteSingleSong');
    getSong({ id }).then((i: Song | null) => {
      if (!i) {
        console.log('>>> Error, song not found');
        return rej('Error, song not found');
      }
      const item = { ...i };

      if (item.status !== 'ready' || !item.songs) {
        console.log('>>> Not ready or not songs!', item);
        return rej('Error, song not ready');
      }

      let index: number | null = null;
      item.songs.map((i: APISong, indexNumber: number) => {
        if (i.id === songId) {
          index = indexNumber;
        }
      });

      if (index !== null) {
        item.songs.splice(index, 1);
      }

      updateSong(item)
        .then((updated: Song) => {
          const song = getSingleSong(item, songId);
          if (song) {
            const filesPromises: Array<Promise<void>> = [];
            filesPromises.push(
              new Promise((res) => {
                const command = `rm "${mediaPath}/ai-music/${item.name}-${song.id}.mp3"`;
                exec(command, { maxBuffer: 1024 * 2048 }, () => res());
              })
            );
            filesPromises.push(
              new Promise((res) => {
                const command = `rm "${mediaPath}/ai-music/${item.name}-${song.id}.jpeg"`;
                exec(command, { maxBuffer: 1024 * 2048 }, () => res());
              })
            );
            if (song.audioWavUrl) {
              filesPromises.push(
                new Promise((res) => {
                  const command = `rm "${mediaPath}/ai-music/${item.name}-${song.id}.wav"`;
                  exec(command, { maxBuffer: 1024 * 2048 }, () => res());
                })
              );
            }
            if (song.videoUrl) {
              filesPromises.push(
                new Promise((res) => {
                  const command = `rm "${mediaPath}/ai-music/${item.name}-${song.id}.mp4"`;
                  exec(command, { maxBuffer: 1024 * 2048 }, () => res());
                })
              );
            }
            if (song.instrumentalUrl) {
              filesPromises.push(
                new Promise((res) => {
                  const command = `rm "${mediaPath}/ai-music/${item.name}-karaoke-${song.id}.mp3"`;
                  exec(command, { maxBuffer: 1024 * 2048 }, () => res());
                })
              );
            }
            if (song.vocalUrl) {
              filesPromises.push(
                new Promise((res) => {
                  const command = `rm "${mediaPath}/ai-music/${item.name}-vocal-${song.id}.mp3"`;
                  exec(command, { maxBuffer: 1024 * 2048 }, () => res());
                })
              );
            }
            if (song.karaokeVideoUrl) {
              filesPromises.push(
                new Promise((res) => {
                  const command = `rm "${mediaPath}/ai-music/${item.name}-karaoke-video-${song.id}.mp4"`;
                  exec(command, { maxBuffer: 1024 * 2048 }, () => res());
                })
              );
            }
            if (filesPromises.length) {
              Promise.all(filesPromises)
                .then(() => console.log('Files delete for', item.name, item.id))
                .catch((error) =>
                  console.log('Error deleting for', item.name, item.id, error)
                );
            }
          }

          res(updated);
        })
        .catch((error) => rej(error));
    });
  });
};

export default deleteSingleSong;
