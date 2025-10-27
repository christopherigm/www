import Song from '@/types/song';
import { deleteSong, getSong } from './song';
import { exec } from 'child_process';
import { mediaPath } from '@/config';

type Parameters = {
  id: string;
};

const deleteSongByID = ({ id }: Parameters): Promise<void> => {
  return new Promise((res, rej) => {
    getSong({ id })
      .then((item: Song | null) => {
        if (!item) {
          return rej('No song to delete :c');
        }
        deleteSong({ id })
          .then(() => {
            const filesPromises: Array<Promise<void>> = [];
            item.songs &&
              item.songs.map((song) => {
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
              });
            if (filesPromises.length) {
              Promise.all(filesPromises)
                .then(() => console.log('Files delete for', item.name, item.id))
                .catch((error) =>
                  console.log('Error deleting for', item.name, item.id, error)
                );
            }
            res();
          })
          .catch((error) => rej(error));
      })
      .catch((error) => rej(error));
  });
};

export default deleteSongByID;
