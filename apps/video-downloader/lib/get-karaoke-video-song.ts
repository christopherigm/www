import Song, { APISong } from '@/types/song';
import { getSong, updateSong } from './song';
import { exec } from 'child_process';
import { mediaPath } from '@/config';

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

type Parameters = {
  id: string;
  songId: string;
};

const getKaraokeVideoSong = ({ id, songId }: Parameters): Promise<Song> => {
  return new Promise(async (res, rej) => {
    getSong({ id }).then((i: Song | null) => {
      if (!i) {
        return rej('Error, song not found');
      }
      console.log('getSong(item):', i.name, ', status:', i.status);
      const item = { ...i };
      const song: APISong | null = getSingleSong(item, songId);
      if (!song || !song.instrumentalUrl || !song.videoUrl) {
        return rej('No song');
      }
      const videoUrl = `${mediaPath}/ai-music/${item.name}-${song.id}.mp4`;
      const instrumentalUrl = `${mediaPath}/ai-music/${item.name}-karaoke-${song.id}.mp3`;
      const vocalUrl = `${mediaPath}/ai-music/${item.name}-vocal-${song.id}.mp3`;
      const videoMusicUrl = `${mediaPath}/ai-music/${item.name}-karaoke-video-${song.id}.ogg`;

      // ffmpeg -i audio1.mp3 -i audio2.mp3 -filter_complex "[0:a]volume=0.2[a1];[1:a]volume=1.0[a2];[a1][a2]amix=inputs=2[a]" -map "[a]" output.mp3
      let command = `ffmpeg -y -i "${instrumentalUrl}" -i "${vocalUrl}" `;
      command += ' -filter_complex ';
      command +=
        '"[0:a]volume=1.0[a1];[1:a]volume=0.1[a2];[a1][a2]amix=inputs=2[a]" ';
      command += '-c:a libvorbis -q:a 9 ';
      command += `-map "[a]" "${videoMusicUrl}"`;
      console.log('music command:', command);
      exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
        if (error) {
          console.log('exec error audio:', error);
          return rej(error);
        }
        const karaokeVideoUrl = `ai-music/${item.name}-karaoke-${song.id}.mp4`;
        // ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4
        command = `ffmpeg -y -i "${videoUrl}" -i "${videoMusicUrl}" `;
        command += '-c:v copy -c:a aac -b:a 192k ';
        command += `-map 0:v:0 -map 1:a:0 "${mediaPath}/${karaokeVideoUrl}"`;
        console.log('video command:', command);
        exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
          if (error) {
            console.log('exec error getting MP4:', error);
          }
          song.karaokeVideoUrl = karaokeVideoUrl;
          item.status = 'ready';
          updateSong(updateSongArray(item, song)).catch((e) =>
            console.log('Error updateSong filesPromises:', e)
          );
          const rmCommand = `rm "${videoMusicUrl}"`;
          exec(rmCommand, { maxBuffer: 1024 * 2048 });
        });
      });
      item.status = 'downloading';
      updateSong(updateSongArray(item, song))
        .then((updated: Song) => res(updated))
        .catch((error) => rej(error));
    });
  });
};

export default getKaraokeVideoSong;
