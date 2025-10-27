import Song, { APISong } from '@/types/song';
import { updateSong } from './song';
import { exec } from 'child_process';
import { mediaPath } from '@/config';
import fs from 'fs';
import { parseFile } from 'music-metadata';
import RandomNumber from '@repo/helpers/random-number';

import GetTimeStampedLyrics from '@/lib/get-timestamped-lyrics';

import CropImages from '@/lib/crop-images';

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

const getMinute = (num: number): string => {
  let minute = Math.round(num);
  minute = Number((minute > 59 ? minute / 60 : 0).toString().split('.')[0]);
  return (minute < 10 ? `0${minute}` : minute).toString();
};

const getSecond = (num: number): string => {
  const minute = Number(getMinute(num));
  if (!minute) {
    const secondStr = Math.floor(num);
    return (secondStr < 10 ? `0${secondStr}` : secondStr).toString();
  }
  const remain = Math.floor(num - minute * 60);
  return (remain < 0 ? '00' : remain < 10 ? `0${remain}` : remain).toString();
};

const timeCode = (starts: number, ends: number): string => {
  let result = '';
  result += '00:';
  result += `${getMinute(starts)}:`;
  result += `${getSecond(starts)}`;
  result += ',000';

  result += ' --> ';

  result += '00:'; // hour
  result += `${getMinute(ends)}:`;
  result += `${getSecond(ends)}`;
  result += ',000';

  return result;
};

const cleanWord = (word: string): string => {
  let clean = word.replaceAll('’', "'");
  if (word.includes('[') && word.includes(']')) {
    clean = word.split(']')[1] ?? word; /// expand
  } else if (word.includes('[') && word.includes('\n')) {
    clean = word.split('\n')[0] ?? word; /// expand
  } else if (word.includes(']') && word.includes('\n')) {
    clean = word.split(']')[0] ?? word; /// expand
  }
  return clean;
};

const compareStrings = (s1: string, s2: string): boolean => {
  let clean1 = s1
    .replaceAll('!', '')
    .replaceAll('¡', '')
    .replaceAll(',', '')
    .replaceAll('"', '')
    .replaceAll('\n', '')
    .replaceAll(' ', '');
  clean1 = clean1.split("'")[0];

  let clean2 = s2
    .replaceAll('!', '')
    .replaceAll('¡', '')
    .replaceAll(',', '')
    .replaceAll('"', '')
    .replaceAll('\n', '')
    .replaceAll(' ', '');
  clean2 = clean2.split("'")[0];

  return clean1 == clean2;
};

type TimeStampedWord = {
  row: string;
  timecodes: string;
  starts: number;
  ends: number;
};

type Parameters = {
  id: string;
  songId: string;
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'wide';
  displayLyrics: boolean;
};

const getPhotoVideoSong = ({
  id,
  songId,
  aspectRatio = 'portrait',
  displayLyrics,
}: Parameters): Promise<Song> => {
  const debugging = false;
  return new Promise(async (res, rej) => {
    if (debugging) {
      console.log('>>> timecodes 117, 118:', timeCode(117, 118));
      console.log('>>> timecodes 116, 119:', timeCode(116, 119));
      console.log('>>> timecodes 115, 120:', timeCode(115, 120));
    }
    GetTimeStampedLyrics({ id, songId }).then((i: Song | null) => {
      if (!i) {
        return rej('Error, song not found');
      }
      console.log('getPhotoVideoSong(item):', i.name, ', status:', i.status);
      const item = { ...i };
      const song: APISong | null = getSingleSong(item, songId);
      console.log('Song lyrics:', song?.timestampedLyrics?.length);
      if (!song || !song.timestampedLyrics || !item.llmLyrics) {
        item.status = 'ready';
        updateSong(item)
          .then((updated: Song) => res(updated))
          .catch((error) => rej(error));
        return rej('No song');
      }

      CropImages(song.id, aspectRatio)
        .then(() => {
          if (!song.timestampedLyrics) {
            return rej('No lyrics');
          }
          //////////////////////////////////////////////////////////////
          if (debugging) {
            song.timestampedLyrics = timestampedLyrics;
            item.llmLyrics = `\nMiraculous whispers, a forgotten dream\nThey’ve come home, it would seem… but nothing’s as it seems.\n\n(Verse 2 - Vocal, quieter again, more melancholic)\nSmall hands reaching, a hesitant embrace`;
          }
          const devidedLyrics = !displayLyrics
            ? []
            : ((item.llmLyrics?.replaceAll('’', "'").split('\n') ?? []).filter(
                (row) =>
                  !row.includes('(') &&
                  !row.includes(')') &&
                  !row.includes('[') &&
                  !row.includes(']') &&
                  !row.includes('**') &&
                  row !== ''
              ) ?? []);

          if (debugging) {
            console.log('devidedLyrics:', devidedLyrics);
          } else {
            console.log('devidedLyrics:', devidedLyrics.length);
          }
          let carry = 0;
          const timeStampedWords: Array<TimeStampedWord> = [];
          for (let i = 0; i < devidedLyrics.length; i++) {
            const row = devidedLyrics[i];
            const words = row.trim().split(' ');
            if (words.length > 2) {
              const firstWord = words[0];
              const finalWord = words[words.length - 1];

              if (debugging) {
                console.log(`firstWord: "${firstWord}"`);
                console.log(`finalWord: "${finalWord}"`);
              }

              let firstIndex = -1;
              let finalIndex = -1;

              let starts = 0;
              let ends = 0;

              for (carry; carry < song.timestampedLyrics.length; carry++) {
                song.timestampedLyrics[carry].word = cleanWord(
                  song.timestampedLyrics[carry].word
                );
                const item = song.timestampedLyrics[carry];

                const word = item.word.trim().replaceAll('\n', '');
                if (debugging) {
                  console.log('word:', word);
                }
                if (compareStrings(firstWord, word)) {
                  firstIndex = carry;
                  starts = item.startS;
                }
                if (compareStrings(finalWord, word)) {
                  finalIndex = carry;
                  ends = item.endS;
                }
                if (starts && ends) {
                  if (debugging) {
                    console.log('starts:', starts);
                    console.log('ends:', ends);
                  }
                  break;
                }
              }
              if (firstIndex !== -1 && finalIndex !== -1) {
                const row = devidedLyrics[i];
                const timecodes = timeCode(starts, ends);
                timeStampedWords.push({ row, starts, ends, timecodes });
              }
            }
          }

          if (debugging) {
            console.log('timeStampedWords', timeStampedWords);
            //// STOP DEBUGGING
            if (timeStampedWords.length < 4000) {
              item.status = 'ready';
              updateSong(updateSongArray(item, song))
                .then((updated: Song) => res(updated))
                .catch((error) => rej(error));
              return;
            }
          } else {
            console.log('timeStampedWords:', timeStampedWords.length);
          }

          // https://www.npmjs.com/package/music-metadata
          const songPath = `${mediaPath}/ai-music/${item.name}-${song.id}.mp3`;
          const songPathOgg = `${mediaPath}/ai-music/${item.name}-${song.id}.ogg`;
          let musicCommand = `ffmpeg -y -i "${songPath}" `;
          musicCommand += `-c:a libvorbis -q:a 9 "${songPathOgg}"`;
          exec(musicCommand, { maxBuffer: 1024 * 2048 }, (error) => {
            if (error) {
              console.log('Error videoCommand:', error);
            }
            console.log('audioCommand OK!');

            parseFile(songPath).then((metadata) => {
              console.log('songPathOgg:', songPathOgg);
              console.log('duration:', metadata.format.duration);
              console.log('metadata:', JSON.stringify(metadata));
              const songDuration = metadata.format.duration ?? 180;

              // 1
              // 00:00:05,000 --> 00:00:07,000
              // This is the first subtitle.
              const SRTFilePath = `${mediaPath}/ai-music/${item.name}-srt-${song.id}.srt`;
              let SRTFileText = '';
              timeStampedWords.map((value: TimeStampedWord, index: number) => {
                SRTFileText += `${index}\n`;
                SRTFileText += `${value.timecodes}\n`;
                SRTFileText += `${value.row}\n\n`;
              });
              if (debugging) {
                console.log('SRTFileText:\n', SRTFileText);
              }
              console.log('SRTFileText:\n', SRTFileText.length);
              fs.writeFileSync(SRTFilePath, SRTFileText, 'utf-8');

              // https://www.bannerbear.com/blog/how-to-create-a-slideshow-from-images-with-ffmpeg/
              const randomID = RandomNumber(1, 999);
              const videoOutputFilePath = `${mediaPath}/ai-music/${item.name}-photo-${song.id}.mp4`;
              const videoOutputFilePathWithMusic = `ai-music/${item.name}-photo-audio-${randomID}-${song.id}.mp4`;
              const videoOutputFilePathWithMusicAndSRT = `ai-music/${item.name}-photo-video-${randomID}-${song.id}.mp4`;
              const images: Array<string> = [];

              // https://www.geeksforgeeks.org/node-js/node-js-fs-readdirsync-method/
              const folder = `${mediaPath}/ai-music/${song.id}-ready-images/`;
              const filenames = fs.readdirSync(folder);
              filenames.forEach((file) => images.push(`${folder}${file}`));

              const slideTime = songDuration / images.length; /// check this
              console.log('images:', images.length);
              console.log('slideTime:', slideTime);

              let videoCommand = 'ffmpeg -y ';
              videoCommand += images
                .map((file) => `-loop 1 -t ${slideTime} -i ${file}`)
                .join(' ');
              videoCommand += ' -filter_complex "';

              videoCommand += images
                .slice(0, images.length - 1)
                .map(
                  (_f: string, i: number) =>
                    `[${i + 1}]fade=d=1:t=in:alpha=1,setpts=PTS-STARTPTS+${
                      (i + 1) * slideTime
                    }/TB[f${i}];`
                )
                .join(' ');

              videoCommand += '[0][f0]overlay[bg1]; ';

              videoCommand += images
                .slice(1, images.length - 2)
                .map(
                  (_f: string, i: number) =>
                    `[bg${i + 1}][f${i + 1}]overlay[bg${i + 2}];`
                )
                .join(' ');

              videoCommand += ` [bg${images.length - 2}][f${
                images.length - 2
              }]overlay,`;

              // videoCommand += ' format=yuv420p, ';
              // videoCommand += ' scale=iw*10:ih*10';
              // videoCommand += " zoompan=z='min(pzoom+0.0015,1.5)', ";
              // videoCommand += '" -map "[v]" -r 25 ';

              videoCommand += ' format=yuv420p[v]" -map "[v]" -r 25 ';
              videoCommand += `"${videoOutputFilePath}"`;
              // console.log('videoCommand:', videoCommand);

              exec(videoCommand, { maxBuffer: 1024 * 2048 }, (error) => {
                if (error) {
                  console.log('Error videoCommand:', error);
                  item.status = 'ready';
                  updateSong(updateSongArray(item, song))
                    .then((updated: Song) => res(updated))
                    .catch((error) => rej(error));
                }
                console.log('videoCommand OK!');

                let videoAudioCommand = `ffmpeg -y -i "${videoOutputFilePath}" -i "${songPathOgg}" `;
                videoAudioCommand += '-c:v copy -c:a aac -b:a 192k ';
                videoAudioCommand += `-map 0:v:0 -map 1:a:0 "${mediaPath}/${videoOutputFilePathWithMusic}"`;
                // console.log('videoAudioCommand:', videoAudioCommand);
                exec(videoAudioCommand, { maxBuffer: 1024 * 2048 }, (error) => {
                  if (error) {
                    console.log('Error videoAudioCommand:', error);
                    item.status = 'ready';
                    updateSong(updateSongArray(item, song))
                      .then((updated: Song) => res(updated))
                      .catch((error) => rej(error));
                  }
                  console.log('videoAudioCommand OK!');

                  // https://stackoverflow.com/questions/8672809/use-ffmpeg-to-add-text-subtitles
                  // ffmpeg -i infile.mp4 -vf subtitles=subtitles.srt mysubtitledmovie.mp4
                  let videoSRTCommand = `ffmpeg -y -i "${mediaPath}/${videoOutputFilePathWithMusic}" `;
                  // videoSRTCommand += '-c:v copy -c:a aac -b:a 192k ';
                  videoSRTCommand += `-vf subtitles="${SRTFilePath}" `;
                  videoSRTCommand += `"${mediaPath}/${videoOutputFilePathWithMusicAndSRT}"`;
                  // console.log('videoSRTCommand:', videoSRTCommand);

                  exec(videoSRTCommand, { maxBuffer: 1024 * 2048 }, (error) => {
                    let successSRT = true;
                    if (error) {
                      console.log('Error videoSRTCommand:', error);
                      successSRT = false;
                    } else {
                      console.log('videoSRTCommand OK!');
                    }
                    // Delete tmp stuff
                    const promises: Array<Promise<void>> = [];
                    promises.push(
                      new Promise((res) => {
                        exec(
                          `rm "${songPathOgg}"`,
                          { maxBuffer: 1024 * 2048 },
                          () => res()
                        );
                      })
                    );
                    promises.push(
                      new Promise((res) => {
                        exec(
                          `rm "${SRTFilePath}"`,
                          { maxBuffer: 1024 * 2048 },
                          () => res()
                        );
                      })
                    );
                    promises.push(
                      new Promise((res) => {
                        exec(
                          `rm "${videoOutputFilePath}"`,
                          { maxBuffer: 1024 * 2048 },
                          () => res()
                        );
                      })
                    );
                    if (successSRT) {
                      promises.push(
                        new Promise((res) => {
                          exec(
                            `rm "${mediaPath}/${videoOutputFilePathWithMusic}"`,
                            { maxBuffer: 1024 * 2048 },
                            () => res()
                          );
                        })
                      );
                    } else {
                      promises.push(
                        new Promise((res) => {
                          exec(
                            `rm "${mediaPath}/${videoOutputFilePathWithMusicAndSRT}"`,
                            { maxBuffer: 1024 * 2048 },
                            () => res()
                          );
                        })
                      );
                    }
                    promises.push(
                      new Promise((res) => {
                        exec(
                          `rm -rf ${mediaPath}/ai-music/${songId}-images/`,
                          { maxBuffer: 1024 * 2048 },
                          () => res()
                        );
                      })
                    );
                    promises.push(
                      new Promise((res) => {
                        exec(
                          `rm -rf ${mediaPath}/ai-music/${songId}-ready-images/`,
                          { maxBuffer: 1024 * 2048 },
                          () => res()
                        );
                      })
                    );
                    Promise.all(promises).then(() =>
                      console.log('Stuff cleaned!')
                    );

                    if (successSRT) {
                      song.photoVideoUrl = videoOutputFilePathWithMusicAndSRT;
                    } else {
                      song.photoVideoUrl = videoOutputFilePathWithMusic;
                    }
                    item.status = 'ready';
                    updateSong(updateSongArray(item, song))
                      .then((updated: Song) => res(updated))
                      .catch((error) => rej(error));
                  });
                });
              });
            });
          });
        })
        .catch((e) => {
          console.log('Error:', e);
          item.status = 'ready';
          updateSong(updateSongArray(item, song))
            .then((updated: Song) => res(updated))
            .catch((error) => rej(error));
        });
      if (song.photoVideoUrl) {
        exec(`rm "${mediaPath}/${song.photoVideoUrl}"`, {
          maxBuffer: 1024 * 2048,
        });
      }
      item.status = 'downloading';
      song.photoVideoUrl = '';
      updateSong(updateSongArray(item, song))
        .then((updated: Song) => res(updated))
        .catch((error) => rej(error));
    });
  });
};

export default getPhotoVideoSong;

const timestampedLyrics = [
  {
    word: 'Miraculous ',
    success: true,
    startS: 62.39362,
    endS: 65.26596,
    palign: 0,
  },
  {
    word: 'whispers, ',
    success: true,
    startS: 65.34574,
    endS: 66.50266,
    palign: 0,
  },
  {
    word: 'a ',
    success: true,
    startS: 66.62234,
    endS: 66.8617,
    palign: 0,
  },
  {
    word: 'forgotten ',
    success: true,
    startS: 66.95035,
    endS: 68.05851,
    palign: 0,
  },
  {
    word: 'dream\n',
    success: true,
    startS: 68.15426,
    endS: 70.69149,
    palign: 0,
  },
  {
    word: 'They’',
    success: true,
    startS: 70.73138,
    endS: 70.85106,
    palign: 0,
  },
  {
    word: 've ',
    success: true,
    startS: 70.93085,
    endS: 71.17021,
    palign: 0,
  },
  {
    word: 'come ',
    success: true,
    startS: 71.25,
    endS: 71.48936,
    palign: 0,
  },
  {
    word: 'home, ',
    success: true,
    startS: 71.56915,
    endS: 71.8883,
    palign: 0,
  },
  {
    word: 'it ',
    success: true,
    startS: 71.96809,
    endS: 72.04787,
    palign: 0,
  },
  {
    word: 'would ',
    success: true,
    startS: 72.1117,
    endS: 72.36702,
    palign: 0,
  },
  {
    word: 'seem… ',
    success: true,
    startS: 72.46676,
    endS: 75.21941,
    palign: 0,
  },
  {
    word: 'but ',
    success: true,
    startS: 75.27926,
    endS: 75.39894,
    palign: 0,
  },
  {
    word: 'nothing’',
    success: true,
    startS: 75.44453,
    endS: 75.71809,
    palign: 0,
  },
  {
    word: 's ',
    success: true,
    startS: 75.79787,
    endS: 76.03723,
    palign: 0,
  },
  {
    word: 'as ',
    success: true,
    startS: 76.15691,
    endS: 76.2766,
    palign: 0,
  },
  {
    word: 'it ',
    success: true,
    startS: 76.39628,
    endS: 76.67553,
    palign: 0,
  },
  {
    word: 'seems.\n\n',
    success: true,
    startS: 76.77128,
    endS: 82.67058,
    palign: 0,
  },
];
