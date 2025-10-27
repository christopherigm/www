'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import { useVideoContext } from '@/state/video-reducer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import useProcessPodcast, {
  type LinkType,
} from '@/state/process-video-podcast';
import { VideoType } from '@/state/video-type';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divisor from '@repo/ui/divisor';
import SendIcon from '@mui/icons-material/Send';
import Slider from '@mui/material/Slider';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import SRTToText from '@repo/helpers/srt-to-text';
import type { ScriptInteraction } from '@/app/generate-podcast-script/route';

type DropDownProps = {
  name: string;
  label: string;
  options: Array<string>;
  defaultValue?: string;
};

type Word = {
  user: number;
  text: string;
};

const DropDown = ({
  name,
  label,
  options,
  defaultValue = 'auto',
}: DropDownProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id={label}>{label}</InputLabel>
      <Select
        labelId={label}
        label={label}
        size="small"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map((key) => {
          return (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

const Podcast = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const { video, dispatch } = useVideoContext();
  const language = browserLanguage;
  const ProcessVideoPodcast = useProcessPodcast();
  const [type, setType] = useState<
    '' | 'podcast_script' | 'local_link_podcast' | 'local_link_podcast_video'
  >('');
  const [words, setWords] = useState<Array<Word>>([]);

  const speakers = [
    'chris',
    'brandon',
    'bearbaito',
    'claudia',
    'peje',
    'poncho',
    'enrique',
    'alazraki',
    'rick',
    'scott',
    'en-alice',
    'en-carter',
    'en-frank',
    'en-mary',
    'en-maya',
    'in-samuel',
    'zh-anchen',
  ];
  const podcastLanguages = [
    {
      code: 'en',
      name: 'English',
    },
    {
      code: 'es',
      name: 'Espanol',
    },
    {
      code: 'fr',
      name: 'French',
    },
    {
      code: 'de',
      name: 'German',
    },
    {
      code: 'it',
      name: 'Italian',
    },
    {
      code: 'pt',
      name: 'Portuguese',
    },
  ];
  const videoBackgrounds = [
    'car',
    'cosmos',
    'galaxy',
    'matrix',
    'minecraft-1',
    'minecraft-2',
    'minecraft-3',
    'space',
  ];

  const doneCallBack = (video: VideoType, type: LinkType, link: string) => {
    video.attributes[type] = link;
    if (type === 'local_link_podcast' || type === 'local_link_podcast_video') {
      video.activeLink = link;
    }
    dispatch({ type: 'patch-data', rawData: video });
  };

  const progressCallBack = (video: VideoType, type: LinkType, link: string) => {
    video.attributes[type] = link;
    dispatch({ type: 'patch-data', rawData: video });
  };

  const isLoading = (link: string) =>
    video.isLoading || ProcessVideoPodcast.isLoading || link === 'processing';

  const getStringValue = (data: string): number => {
    let value = 0;
    data.split('').map((i) => {
      value += i.codePointAt(0) ?? 0;
    });
    return value;
  };

  const isSizeSimilar = (str1: string, str2: string): boolean => {
    if (!str1 || !str2) {
      return false;
    }
    const l1 = str1.length;
    const l2 = str2.length;
    const difference = Math.abs(l1 - l2);
    const total = l1 + l2;
    const ratio = (difference * 100) / total;
    console.log('ratio:', ratio);
    return ratio < 12;
  };

  const hasSimilarWords = (str1: string, str2: string): boolean => {
    const str1Value = getStringValue(str1);
    const str2Value = getStringValue(str2);
    console.log('=======================');
    console.log('strs:', str1, '->', str2);
    console.log('str1Value:', str1Value);
    console.log('str2Value:', str2Value);
    const difference = Math.abs(str1Value - str2Value);
    console.log('difference:', difference);
    const total = str1Value + str2Value;
    const ratio = (difference * 100) / total;
    console.log('ratio:', ratio);
    return ratio < 1;
  };

  const wordLikelihood = (str1: string, str2: string): boolean => {
    if (!str1 || !str2) {
      return false;
    }
    if (str1 === str2) {
      return true;
    }
    if (str1.includes(str2) || str2.includes(str1)) {
      console.log('>> wordLikelihood:', str2, '>', str1);
      return isSizeSimilar(str1, str2);
    }
    return hasSimilarWords(str1, str2);
  };

  useEffect(() => {
    // console.log(hasSimilarWords('la', 'yo'));
    // return console.log(hasSimilarWords('encante', 'encanta'));

    // console.log('Like', wordLikelihood('tenerlos', 'detenerlos'));
    // console.log('Like', wordLikelihood('hola', 'mundo'));
    // console.log('detenerlos'.includes('tenerlos'));
    // return console.log('tenerlos'.includes('detenerlos'));
    if (
      !video.attributes.podcast_script ||
      video.attributes.podcast_script === 'processing' ||
      video.attributes.podcast_script === 'error' ||
      !video.attributes.podcast_srt
    ) {
      return;
    }

    const srtWords: Array<string> = SRTToText(video.attributes.podcast_srt)
      .replaceAll("'", '')
      .replaceAll('.', '')
      .replaceAll(',', '')
      .replaceAll('?', '')
      .replaceAll('\r', '')
      .split('\n');
    console.log('>> podcast srt:\n\n', srtWords);

    // const users: {[index: number]: string} = {}
    const scriptInteractions: Array<ScriptInteraction> = JSON.parse(
      video.attributes.podcast_script ?? '[]'
    );
    const words: Array<Word> = [];
    console.log('>> podcast scriptInteractions:\n\n', scriptInteractions);

    let pointer = 0;
    scriptInteractions.map((i: ScriptInteraction) => {
      console.log('==============================');
      console.log('text:', i.text);
      // srtWords = srtWords.slice(pointer, srtWords.length);
      // console.log('srtWords:', srtWords);

      const allWords: Array<string> = i.text
        .replaceAll("'", '')
        .replaceAll('.', '')
        .replaceAll(',', '')
        .replaceAll('?', '')
        .replaceAll('\r', '')
        .split(' ');
      const initialWord: string = allWords[0];
      const finalWord: string = allWords[allWords.length - 1];

      let initialWordIndex = -1;
      let finalWordIndex = -1;
      for (let j = pointer; j <= srtWords.length; j++) {
        // const element = array[j];
        pointer = j;
        console.log('pointer:', pointer);
        // if (srtWords[j] === initialWord) {
        if (wordLikelihood(srtWords[j], initialWord)) {
          initialWordIndex = pointer;
        }
        console.log('srtWords[j]:', finalWord, '-> ', srtWords[j]);
        // if (srtWords[j] === finalWord) {
        if (wordLikelihood(srtWords[j], finalWord)) {
          finalWordIndex = pointer;
          break;
        }
      }

      console.log('>> initialWord: ', initialWord, initialWordIndex);
      console.log('>> FinalWord: ', finalWord, finalWordIndex);

      for (let z = initialWordIndex; z <= finalWordIndex; z++) {
        words.push({
          user: i.speakerID,
          text: srtWords[z],
        });
      }
      console.log('speakerID:', i.speakerID);
    });
    console.log('>> words:\n\n', words);

    setWords(words);
  }, [video.attributes.podcast_script, video.attributes.podcast_srt]);

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box display="flex" alignItems="end">
          <Button
            variant="contained"
            color="inherit"
            endIcon={
              <DescriptionIcon
                color={
                  video.attributes.podcast_script === 'error'
                    ? 'error'
                    : 'success'
                }
              />
            }
            sx={{
              textTransform: 'initial',
            }}
            disabled={
              ProcessVideoPodcast.isLoading ||
              isLoading(video.attributes.podcast_script)
            }
            onClick={() => setType('podcast_script')}
            fullWidth
          >
            {video.attributes.podcast_script &&
            video.attributes.podcast_script !== 'processing' ? (
              <>{language === 'en' ? 'Script' : 'Script'}</>
            ) : (
              <>{language === 'en' ? 'Script' : 'Script'}</>
            )}
          </Button>
          <Box width={10} flexShrink={0} />
          <Button
            variant="contained"
            color="inherit"
            endIcon={
              <MicIcon
                color={
                  video.attributes.local_link_podcast === 'error'
                    ? 'error'
                    : 'success'
                }
              />
            }
            sx={{
              textTransform: 'initial',
            }}
            disabled={
              ProcessVideoPodcast.isLoading ||
              isLoading(video.attributes.local_link_podcast) ||
              isLoading(video.attributes.podcast_script) ||
              !video.attributes.podcast_script ||
              video.attributes.podcast_script === 'error'
            }
            onClick={() => setType('local_link_podcast')}
            fullWidth
          >
            {video.attributes.local_link_podcast &&
            video.attributes.local_link_podcast !== 'processing' ? (
              <>{language === 'en' ? 'Audio' : 'Audio'}</>
            ) : (
              <>{language === 'en' ? 'Audio' : 'Audio'}</>
            )}
          </Button>
        </Box>

        {video.attributes.local_link_podcast ? (
          <>
            <HorizontalDivisor margin={1} />
            <Box display="flex" flexDirection="column">
              <Typography
                variant="body2"
                fontWeight="normal"
                textAlign="center"
              >
                {language === 'en' ? 'Video' : 'Video'}
              </Typography>
              <Divisor height={5} />
              <Box display="flex">
                <Button
                  variant="contained"
                  color="inherit"
                  endIcon={
                    <VideoChatIcon
                      color={
                        video.attributes.local_link_podcast_video === 'error'
                          ? 'error'
                          : 'success'
                      }
                    />
                  }
                  sx={{
                    textTransform: 'initial',
                  }}
                  disabled={
                    ProcessVideoPodcast.isLoading ||
                    isLoading(video.attributes.local_link_podcast_video) ||
                    isLoading(video.attributes.local_link_podcast) ||
                    !video.attributes.local_link_podcast ||
                    video.attributes.local_link_podcast === 'error'
                  }
                  onClick={() => setType('local_link_podcast_video')}
                  fullWidth
                >
                  {video.attributes.local_link_podcast_video &&
                  video.attributes.local_link_podcast_video !== 'processing' ? (
                    <>{language === 'en' ? 'Create' : 'Create'}</>
                  ) : (
                    <>{language === 'en' ? 'Create' : 'Create'}</>
                  )}
                </Button>
                <Box width={5} flexShrink={0} />
                <Button
                  variant="contained"
                  color="inherit"
                  endIcon={
                    <AutoFixHighIcon
                      color={
                        video.attributes.local_link_podcast_video === 'error'
                          ? 'error'
                          : 'success'
                      }
                    />
                  }
                  sx={{
                    textTransform: 'initial',
                  }}
                  disabled={
                    ProcessVideoPodcast.isLoading ||
                    isLoading(video.attributes.local_link_podcast_video) ||
                    isLoading(video.attributes.local_link_podcast) ||
                    !video.attributes.local_link_podcast ||
                    video.attributes.local_link_podcast === 'error'
                  }
                  onClick={() => setType('local_link_podcast_video')}
                  fullWidth
                >
                  {video.attributes.local_link_podcast_video &&
                  video.attributes.local_link_podcast_video !== 'processing' ? (
                    <>{language === 'en' ? 'Improve' : 'Mejorar'}</>
                  ) : (
                    <>{language === 'en' ? 'Improve' : 'Mejorar'}</>
                  )}
                </Button>
              </Box>
            </Box>
          </>
        ) : null}

        {ProcessVideoPodcast.isLoading ||
        isLoading(video.attributes.local_link_podcast) ||
        isLoading(video.attributes.local_link_podcast_video) ? (
          <Box width="100%" marginTop={0.5} marginBottom={0.5}>
            <LinearProgress />
          </Box>
        ) : null}
      </Box>

      <HorizontalDivisor margin={1} />
      <Typography variant="body2" fontWeight="normal" textAlign="center">
        {language === 'en' ? 'Words in video' : 'Palabras en el video'}
      </Typography>
      <Stack direction="row" spacing={1} marginTop={1} flexWrap="wrap">
        {words.map((word: Word, index: number) => {
          return (
            <Chip
              key={index}
              color={word.user === 1 ? 'primary' : 'success'}
              label={word.text}
              variant="filled"
              sx={{ marginBottom: 7 }}
            />
          );
        })}
      </Stack>

      <Modal
        open={type !== ''}
        onClose={() => setType('')}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100vh',
        }}
      >
        <Box width="100%" maxWidth={600} padding={2}>
          <Paper elevation={2}>
            <Box padding={1} display="flex" flexDirection="column">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" fontWeight="bold">
                  {type === 'podcast_script'
                    ? language === 'en'
                      ? 'Create Podcast Script'
                      : 'Crear Podcast Script'
                    : ''}
                  {type === 'local_link_podcast'
                    ? language === 'en'
                      ? 'Create Podcast Audio'
                      : 'Crear Audio del podcast'
                    : ''}
                  {type === 'local_link_podcast_video'
                    ? language === 'en'
                      ? 'Create Podcast Video'
                      : 'Crear Video del podcast'
                    : ''}
                </Typography>
                <IconButton
                  aria-label="close"
                  size="small"
                  onClick={() => setType('')}
                  color="error"
                  style={{
                    width: 35,
                    height: 35,
                    boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                  }}
                >
                  <CloseFullscreenIcon fontSize="small" />
                </IconButton>
              </Box>
              <HorizontalDivisor margin={1} />
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const formData = new FormData(form);
                  if (type === 'podcast_script') {
                    const name = formData.get('name')?.toString().trim() ?? '';
                    const speaker1 =
                      formData.get('user_1')?.toString().trim() ?? 'Chris';
                    const speaker2 =
                      formData.get('user_2')?.toString().trim() ?? 'Brandon';
                    const speakers = [speaker1, speaker2].filter(
                      (i) => i !== ''
                    );
                    const mood = formData.get('mood')?.toString().trim() ?? '';
                    const language =
                      formData.get('podcastLanguage')?.toString().trim() ?? '';
                    const match = podcastLanguages.find(
                      (v) => v.name === language
                    );
                    const codeLanguage = match?.code ?? 'en';
                    const lengthValue = Number(
                      formData.get('length')?.toString().trim() ?? '2'
                    );
                    let length = 'medium';
                    if (lengthValue === 1) {
                      length = 'small';
                    } else if (lengthValue === 3) {
                      length = 'long';
                    }
                    const instrucctions =
                      formData.get('instrucctions')?.toString().trim() ?? '';
                    ProcessVideoPodcast.script({
                      video,
                      mood,
                      language,
                      codeLanguage,
                      speakers,
                      name,
                      instrucctions,
                      length,
                      type: 'podcast_script',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'podcast_script', link),
                      progressCallBack: (v) =>
                        progressCallBack(video, 'podcast_script', v),
                    });
                  } else if (type === 'local_link_podcast') {
                    const speaker1 =
                      formData.get('speaker1')?.toString().trim() ?? 'Chris';
                    const speaker2 =
                      formData.get('speaker2')?.toString().trim() ?? 'Brandon';
                    const speakers = [speaker1, speaker2].filter(
                      (i) => i !== '' && i !== 'auto'
                    );
                    ProcessVideoPodcast.audio({
                      video,
                      speakers,
                      type: 'local_link_podcast',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'local_link_podcast', link),
                      progressCallBack: (v) =>
                        progressCallBack(video, 'local_link_podcast', v),
                    });
                  } else if (type === 'local_link_podcast_video') {
                    const videoBackground =
                      formData.get('videoBackground')?.toString().trim() ?? '';
                    ProcessVideoPodcast.video({
                      video,
                      videoBackground,
                      type: 'local_link_podcast_video',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'local_link_podcast_video', link),
                    });
                  }
                  setType('');
                }}
              >
                <Divisor height={4} />
                {type === 'podcast_script' ? (
                  <>
                    <DropDown
                      label={
                        language === 'en'
                          ? 'Script language'
                          : 'Idioma del script'
                      }
                      defaultValue="English"
                      name="podcastLanguage"
                      options={podcastLanguages.map((i) => i.name)}
                    />
                    <Divisor />
                    <TextField
                      label={
                        language === 'en'
                          ? 'Podcast name'
                          : 'Nombre del podcast'
                      }
                      size="small"
                      name="name"
                      type="text"
                      fullWidth
                    />
                    <Divisor />
                    <TextField
                      label={
                        language === 'en' ? 'Podcast mood' : 'Tono del podcast'
                      }
                      placeholder={
                        language === 'en'
                          ? 'Relax, Excited, Controversial'
                          : 'Relajado, excitado, controversial'
                      }
                      size="small"
                      name="mood"
                      type="text"
                      fullWidth
                    />
                    <Divisor />
                    <TextField
                      label={language === 'en' ? 'Speaker 1' : 'Persona 1'}
                      size="small"
                      name="user_1"
                      type="text"
                      fullWidth
                    />
                    <Divisor />
                    <TextField
                      label={language === 'en' ? 'Speaker 2' : 'Persona 2'}
                      size="small"
                      name="user_2"
                      type="text"
                      fullWidth
                    />
                    <Divisor />
                    <TextField
                      label={
                        language === 'en'
                          ? 'Aditional indications (optional)'
                          : 'Indicaciones adicionales (opcional)'
                      }
                      size="small"
                      name="instrucctions"
                      type="text"
                      maxRows={3}
                      multiline
                      fullWidth
                    />
                    <Divisor />
                    <Typography variant="body1">
                      {language === 'en'
                        ? 'Podcast script length'
                        : 'Longitud del podcast'}
                    </Typography>
                    <Box paddingX={3}>
                      <Slider
                        name="length"
                        aria-label="Length"
                        defaultValue={2}
                        marks={[
                          {
                            value: 1,
                            label: language === 'en' ? 'Short' : 'Corto',
                          },
                          {
                            value: 2,
                            label: language === 'en' ? 'Medium' : 'Medio',
                          },
                          {
                            value: 3,
                            label: language === 'en' ? 'Long' : 'Largo',
                          },
                        ]}
                        valueLabelDisplay="auto"
                        step={1}
                        min={1}
                        max={3}
                      />
                    </Box>
                    <Divisor />
                    <Button
                      variant="contained"
                      color="success"
                      endIcon={<SendIcon />}
                      sx={{
                        textTransform: 'initial',
                      }}
                      type="submit"
                      fullWidth
                    >
                      {language === 'en' ? 'Create Script' : 'Crear Script'}
                    </Button>
                  </>
                ) : type === 'local_link_podcast' ? (
                  <>
                    <DropDown
                      label={language === 'en' ? 'Speaker 1' : 'Persona 1'}
                      name="speaker1"
                      options={speakers}
                    />
                    <Divisor />
                    <DropDown
                      label={language === 'en' ? 'Speaker 1' : 'Persona 1'}
                      name="speaker2"
                      options={speakers}
                    />
                    <Divisor />
                    <Button
                      variant="contained"
                      color="success"
                      endIcon={<SendIcon />}
                      sx={{
                        textTransform: 'initial',
                      }}
                      type="submit"
                      fullWidth
                    >
                      {language === 'en' ? 'Create Audio' : 'Crear Audio'}
                    </Button>
                  </>
                ) : type === 'local_link_podcast_video' ? (
                  <>
                    <DropDown
                      label={
                        language === 'en'
                          ? 'Video background'
                          : 'Fondo del video'
                      }
                      name="videoBackground"
                      options={videoBackgrounds}
                    />
                    <Divisor />
                    <Button
                      variant="contained"
                      color="success"
                      endIcon={<SendIcon />}
                      sx={{
                        textTransform: 'initial',
                      }}
                      type="submit"
                      fullWidth
                    >
                      {language === 'en' ? 'Create Video' : 'Crear Video'}
                    </Button>
                  </>
                ) : null}
              </form>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </>
  );
};

export default Podcast;
