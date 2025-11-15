import fs from 'fs';
import type { NextRequest } from 'next/server';
import GetVideoByID from '@/lib/get-video-by-id';
import UpdateVideoAttributes from '@/lib/update-video-attributes';
import RandomNumber from '@repo/helpers/random-number';
import OllamaQuery from '@repo/helpers/ollama';
import GenerateAIAudio from '@repo/helpers/generate-ai-audio';
import GetWavLength from '@repo/helpers/get-wav-length';
import ChangeVideoLength from '@repo/helpers/change-video-length';
import AddAudioToVideoInTime from '@repo/helpers/add-audio-to-video-in-time';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body?.id ?? null;
  const language = body?.language ?? 'Spanish';
  const rawSpeakers: Array<string> = body?.speakers ?? ['Chris'];
  const speakers = rawSpeakers.filter((i) => i !== '' && i !== 'auto');
  if (!id || !speakers.length) {
    return Response.json(
      {
        id: '',
        status: 'error',
        url: '',
        error: 'No prompt provided',
      },
      {
        status: 400,
      }
    );
  }

  return GetVideoByID(id)
    .then(async (video) => {
      console.log('=====================================');
      const originalFile = video.attributes.local_link_translated_audio;
      console.log('Processing translated audio - video #', video.id);
      video.attributes.logs += '\n\n> processing video for audio! \n\n';

      const splittedTranscriptions = video.attributes.clean_transcriptions
        .replaceAll('\r', '\n')
        .replaceAll('\n', '')
        .replaceAll('...', '')
        .replaceAll('"', '')
        .replaceAll('/', '')
        .replaceAll('”', '')
        .replaceAll('“', '');

      let system = 'You are a very skilled linguistic that translates ';
      system += 'text from one language to another. ';
      let prompt = 'Translate the following text: ';
      prompt += `"${splittedTranscriptions}" to ${language}. `;
      prompt += 'Respond just with the translation.';
      OllamaQuery({
        prompt,
        system,
        host: 'http://192.168.0.24:11434',
      })
        .then((query) => {
          const cleanText = query.response
            .replaceAll('...', '')
            .replaceAll('"', '')
            .replaceAll('/', '')
            .replaceAll('”', '')
            .replaceAll('“', '')
            .replaceAll('\n', '');
          const text = `Speaker 1: ${cleanText}`;

          const sufix = RandomNumber(1, 99999);
          const dest = `${video.attributes.uuid}.podcast.${sufix}`;
          console.log('>> GenerateAIAudio speakers:', speakers);
          GenerateAIAudio({ dest, text, speakers })
            .then(async (generatedWav) => {
              const originalVideo = video.attributes.local_link;
              const translatedVideoTmp = `${video.attributes.uuid}.translated_audio.tmp.mp4`;
              const sufix = RandomNumber(1, 99999);
              const translatedVideo = `${video.attributes.uuid}.translated_audio-${sufix}.mp4`;
              const wavLength = await GetWavLength({ src: generatedWav });
              const videoLength = await GetWavLength({ src: originalVideo });
              // console.log('>> wavLength:', wavLength);
              // console.log('>> videoLength:', videoLength);
              let setptsFactor = Number((wavLength / videoLength).toFixed(2));
              if (setptsFactor < 0.5) {
                setptsFactor = 0.5;
              }
              console.log('>> setptsFactor:', setptsFactor);
              await ChangeVideoLength({
                src: originalVideo,
                dest: translatedVideoTmp,
                setptsFactor,
              });

              await AddAudioToVideoInTime({
                src_video: translatedVideoTmp,
                // src_audio: videoAudio,
                src_audio: generatedWav,
                dest: translatedVideo,
                offset: 0,
              });
              const rootFolder = nodeEnv == 'production' ? '/app' : 'public';
              try {
                fs.rmSync(`${rootFolder}/${originalFile}`);
              } catch {}
              video.attributes.local_link_translated_audio = `media/${translatedVideo}`;

              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
              fs.rmSync(`${rootFolder}/${generatedWav}`);
              fs.rmSync(`${rootFolder}/media/${translatedVideoTmp}`);
            })
            .catch((e) => {
              console.log('>> Post voice AI error:', e);
              video.attributes.local_link_translated_audio = 'error';
              UpdateVideoAttributes(video).catch((error) =>
                console.log('>> video.save() error:', error)
              );
            });
        })
        .catch((e) => {
          console.log('>> Post voice AI error:', e);
          video.attributes.local_link_translated_audio = 'error';
          UpdateVideoAttributes(video).catch((error) =>
            console.log('>> video.save() error:', error)
          );
        });
      video.attributes.local_link_translated_audio = 'processing';
      return UpdateVideoAttributes(video)
        .then(() => Response.json({ data: 'processing' }, { status: 200 }))
        .catch((error) => console.log('>> video.save() error:', error));
    })
    .catch((error) => {
      console.log('>> API() - video error:', error);
      return Response.json({ data: 'error' }, { status: 400 });
    });
}

// import fs from 'fs';
// import type { NextRequest } from 'next/server';
// import GetVideoByID from '@/lib/get-video-by-id';
// import UpdateVideoAttributes from '@/lib/update-video-attributes';
// import GetWavLength from '@repo/helpers/get-wav-length';
// import ChangeVideoLength from '@repo/helpers/change-video-length';
// import AddAudioToVideoInTime from '@repo/helpers/add-audio-to-video-in-time';
// import RemoveVocalsFromAudio from '@repo/helpers/remove-vocals-from-audio';
// import MergeWavFiles from '@repo/helpers/merge-wav-files';
// import ExtractAudioFromVideo from '@repo/helpers/extract-audio-from-video';
// import ChangeVolumeWav from '@repo/helpers/change-volume-wav';
// import Post from '@repo/helpers/api-post';
// import RandomNumber from '@repo/helpers/random-number';
// import OllamaQuery from '@repo/helpers/ollama';
// import { VideoType } from '@/state/video-type';

// const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

// type DictTranscription = {
//   [key: string]: {
//     time: string;
//     text: string;
//   };
// };

// type StructuredTranscription = {
//   id: string;
//   time: string;
//   text: string;
// };

// type Props = {
//   video: VideoType;
//   text: string;
// };

// const SendRequest = ({ video, text }: Props) => {
//   const url = 'http://192.168.0.28:8080/';
//   const data = {
//     name: video.attributes.uuid,
//     output_dir: 'media',
//     device: 'cuda',
//     text,
//     speaker_names: 'chris',
//     cfg_scale: '1.8',
//     production: nodeEnv == 'production',
//   };
//   Post(url, data)
//     .then(async (response: { status: string }) => {
//       if (response.status === 'busy') {
//         console.log('Server busy, retriying in 5 seconds, Video #', video.id);
//         return setTimeout(() => SendRequest({ video, text }), 5000);
//       }
//       const generatedWav = `${video.attributes.uuid}_generated.wav`;
//       const originalVideo = `${video.attributes.uuid}.mp4`;
//       // const videoAudioTmp = `${video.attributes.uuid}.video_audio.tmp.wav`;
//       // const videoAudio = `${video.attributes.uuid}.video_audio.wav`;
//       // const karaokeAudio = `${video.attributes.uuid}.video_audio.karaoke.wav`;
//       const translatedVideoTmp = `${video.attributes.uuid}.translated_audio.tmp.mp4`;
//       const sufix = RandomNumber(1, 99999);
//       const translatedVideo = `${video.attributes.uuid}.translated_audio-${sufix}.mp4`;
//       const wavLength = await GetWavLength({ src: generatedWav });
//       const videoLength = await GetWavLength({ src: originalVideo });
//       console.log('>> wavLength:', wavLength);
//       console.log('>> videoLength:', videoLength);
//       const setptsFactor = wavLength / videoLength;
//       console.log('>> setptsFactor:', setptsFactor);
//       await ChangeVideoLength({
//         src: originalVideo,
//         dest: translatedVideoTmp,
//         setptsFactor,
//       });
//       // await ExtractAudioFromVideo({
//       //   src: translatedVideoTmp,
//       //   dest: videoAudioTmp,
//       // });
//       // await ChangeVolumeWav({
//       //   src: videoAudioTmp,
//       //   dest: videoAudio,
//       //   volume: 0.2,
//       // });
//       // await RemoveVocalsFromAudio({
//       //   src: videoAudio,
//       //   dest: karaokeAudio,
//       // });
//       // await MergeWavFiles({
//       //   files: [karaokeAudio, generatedWav],
//       //   dest: videoAudio,
//       // });
//       await AddAudioToVideoInTime({
//         src_video: translatedVideoTmp,
//         // src_audio: videoAudio,
//         src_audio: generatedWav,
//         dest: translatedVideo,
//         offset: 0,
//       });
//       video.attributes.local_link_translated_audio = `media/${translatedVideo}`;
//       UpdateVideoAttributes(video).catch((error) =>
//         console.log('>> video.save() error:', error)
//       );
//       const rootFolder =
//         nodeEnv == 'production' ? '/app/media' : 'public/media';
//       fs.rmSync(`${rootFolder}/${generatedWav}`);
//       fs.rmSync(`${rootFolder}/${translatedVideoTmp}`);
//       // fs.rmSync(`${rootFolder}/${videoAudioTmp}`);
//       // fs.rmSync(`${rootFolder}/${videoAudio}`);
//       // fs.rmSync(`${rootFolder}/${karaokeAudio}`);
//     })
//     .catch((e) => {
//       console.log('>> Post voice AI error:', e);
//       video.attributes.local_link_translated_audio = 'error';
//       UpdateVideoAttributes(video).catch((error) =>
//         console.log('>> video.save() error:', error)
//       );
//     });
// };

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const id = body?.id ?? null;
//   if (!id) {
//     return Response.json(
//       {
//         id: '',
//         status: 'error',
//         url: '',
//         error: 'No prompt provided',
//       },
//       {
//         status: 400,
//       }
//     );
//   }

//   GetVideoByID(id)
//     .then(async (video) => {
//       console.log('=====================================');
//       console.log('Processing translated audio - video #', video.id);
//       video.attributes.logs += '\n\n> processing video for audio! \n\n';
//       video.attributes.local_link_translated_audio = 'processing';
//       UpdateVideoAttributes(video).catch((error) =>
//         console.log('>> video.save() error:', error)
//       );

//       /*
//       const splittedTranscriptions = video.attributes.translated_transcriptions
//         .replaceAll('\r', '\n')
//         .split('\n');

//       const dict: DictTranscription = {};

//       let lastID = '';
//       splittedTranscriptions.map((i: string) => {
//         if (!isNaN(Number(i)) && !dict[i] && i !== '' && i.length < 3) {
//           dict[i] = {
//             time: '',
//             text: '',
//           };
//           lastID = i;
//         } else if (i.search('-->') > -1 && dict[lastID]) {
//           dict[lastID].time = i;
//         } else if (dict[lastID]) {
//           dict[lastID].text += i + ' ';
//         }
//       });

//       const structuredTranscriptions: Array<StructuredTranscription> = [];

//       Object.keys(dict).map((key) => {
//         structuredTranscriptions.push({
//           id: key,
//           time: dict[key].time,
//           text: dict[key].text,
//         });
//       });

//       if (!structuredTranscriptions.length) {
//         video.attributes.local_link_translated_audio = 'error';
//         return UpdateVideoAttributes(video).catch((error) =>
//           console.log('>> video.save() error:', error)
//         );
//       }
//       console.log('To be translated length:', structuredTranscriptions.length);

//       const url = 'http://192.168.0.28:8080/';
//       let text = 'Speaker 1: ';
//       for (let i = 0; i < structuredTranscriptions.length; i++) {
//         text += structuredTranscriptions[i].text
//           .trim()
//           .replaceAll('...', '')
//           .replaceAll('"', '')
//           .replaceAll('/', '')
//           .replaceAll('”', '')
//           .toLowerCase();
//         text += ' ';
//       }
//       */

//       const splittedTranscriptions = video.attributes.clean_transcriptions
//         .replaceAll('\r', '\n')
//         .replaceAll('\n', '')
//         .replaceAll('...', '')
//         .replaceAll('"', '')
//         .replaceAll('/', '')
//         .replaceAll('”', '')
//         .replaceAll('“', '');

//       let system = 'You are a very skilled linguistic that translates ';
//       system += 'text from one language to another. ';
//       let prompt = 'Translate the following text: ';
//       prompt += `"${splittedTranscriptions}" to Spanish. `;
//       prompt += 'Respond just with the translation.';
//       const query = await OllamaQuery({
//         prompt,
//         system,
//         host: 'http://192.168.0.24:11434',
//       });
//       const cleanText = query.response
//         .replaceAll('...', '')
//         .replaceAll('"', '')
//         .replaceAll('/', '')
//         .replaceAll('”', '')
//         .replaceAll('“', '')
//         .replaceAll('\n', '');
//       const text = `Speaker 1: ${cleanText}`;
//       SendRequest({ video, text });
//       // console.log('Text', text);

//       // for (let i = 0; i < structuredTranscriptions.length; i++) {
//       //   const data = {
//       //     name: `${video.attributes.uuid}-${i}`,
//       //     output_dir,
//       //     device: 'cuda',
//       //     text: `Speaker 1: ${structuredTranscriptions[i].text.trim()}`,
//       //     speaker_names: 'brandon',
//       //     cfg_scale: '1.7',
//       //     production: nodeEnv == 'production',
//       //   };
//       //   const result = await Post(url, data);
//       //   if (result.status) {
//       //     const file = `${video.attributes.uuid}/${video.attributes.uuid}-${i}_generated.wav`;
//       //     audio_files.push(file);
//       //   }
//       // }
//       // console.log('Data:', audio_files);
//       // console.log('Data length:', audio_files.length);
//       // ConcatWavFiles({
//       //   files: audio_files,
//       //   dest: `${video.attributes.uuid}.translated_audio.wav`,
//       // });

//       // console.log('Video completed! #', video.id);
//       // video.attributes.local_link_translated_audio = `media/${video.attributes.uuid}_generated.wav`;
//       // UpdateVideoAttributes(video).catch((error) =>
//       //   console.log('>> video.save() error:', error)
//       // );

//       /*
//       let src_video = video.attributes.uuid;
//       const local_link = video.attributes.local_link.split('/');
//       if (local_link.length) {
//         const file = local_link[local_link.length - 1];
//         src_video = file;
//       }

//       const clonedVideo = `${video.attributes.uuid}/video.mp4`;
//       const videoAudio = `${video.attributes.uuid}/video_audio.wav`;
//       const karaokeAudio = `${video.attributes.uuid}/video_audio.karaoke.wav`;
//       const karaokeVideoBase = `${video.attributes.uuid}/video.karaoke`;
//       const karaokeVideo = `${karaokeVideoBase}.mp4`;
//       CopyFile({
//         src: src_video,
//         dest: clonedVideo,
//       })
//         .then(() => {
//           console.log('CopyFile OK!', clonedVideo);
//           ExtractAudioFromVideo({
//             src: clonedVideo,
//             dest: videoAudio,
//           })
//             .then(() => {
//               console.log('ExtractAudioFromVideo OK!', videoAudio);

//               RemoveVocalsFromAudio({
//                 src: videoAudio,
//                 dest: karaokeAudio,
//               })
//                 .then(() => {
//                   console.log('RemoveVocalsFromAudio OK!', karaokeAudio);

//                   AddAudioToVideoInTime({
//                     src_video: clonedVideo,
//                     src_audio: karaokeAudio,
//                     dest: karaokeVideo,
//                     offset: 0,
//                   })
//                     .then(async () => {
//                       // await CopyFile({
//                       //   src: `${karaokeVideoBase}.mp4`,
//                       //   dest: `${karaokeVideoBase}.backup.mp4`,
//                       // });
//                       const curedFilesArray: Array<string> = [];
//                       curedFilesArray.push(karaokeAudio);
//                       for (let i = 0; i < audio_files.length; i++) {
//                         // const dest = `${karaokeVideoBase}.${i}.mp4`;
//                         const time =
//                           structuredTranscriptions[i].time.split(' --> ')[1];
//                         const offset = time.split(',')[0].split(':');
//                         // console.log('>>> offset:', offset[offset.length - 1]);
//                         const cured = `${video.attributes.uuid}/audio-${i}.wav`;
//                         await AddSilenceToWav({
//                           src: `${video.attributes.uuid}/${video.attributes.uuid}-${i}_generated.wav`,
//                           dest: cured,
//                           time: Number(offset[offset.length - 1]) - 0.9,
//                         });
//                         curedFilesArray.push(cured);
//                         fs.rmSync(
//                           `public/media/${video.attributes.uuid}/${video.attributes.uuid}-${i}_generated.wav`
//                         );
//                       }
//                       await MergeWavFiles({
//                         files: curedFilesArray,
//                         dest: `${video.attributes.uuid}/complete_sequence.wav`,
//                       });
//                       await AddAudioToVideoInTime({
//                         src_video: karaokeVideo,
//                         src_audio: `${video.attributes.uuid}/complete_sequence.wav`,
//                         dest: `${karaokeVideoBase}.complete.mp4`,
//                         offset: 0,
//                       });

//                       console.log('AddAudioToVideoInTime OK!', karaokeAudio);
//                     })
//                     .catch((e) =>
//                       console.log('Error AddAudioToVideoInTime:', e)
//                     );
//                 })
//                 .catch((e) => console.log('Error RemoveVocalsFromAudio:', e));
//             })
//             .catch((e) => console.log('Error ExtractAudioFromVideo:', e));
//         })
//         .catch((e) => console.log('Error CopyFile:', e));
//                 */
//     })
//     .catch((error) => console.log(error));

//   return Response.json({ data: 'processing' }, { status: 200 });z
// }
