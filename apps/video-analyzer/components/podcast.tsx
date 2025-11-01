'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import { useVideoContext } from '@/state/video-reducer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
import { useSystemContext } from '@/state/system-reducer';
import useBackgroundVideo from '@/state/use-background-video';
import useBackgroundMusic from '@/state/use-background-music';
import SSRPlayer from '@/components/ssr-player';
import { BackgroundVideoType } from '@/state/background-video-type';
import { BackgroundMusicType } from '@/state/background-music-type';
import GetDomainURLFromEnv from '@repo/helpers/get-domain-url';
const domainURL = GetDomainURLFromEnv();

import PodcastScript from '@/components/podcast-script';

type DropDownProps = {
  name: string;
  label: string;
  options: Array<string>;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

const DropDown = ({
  name,
  label,
  options,
  defaultValue = 'auto',
  onChange,
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
        onChange={(e) => {
          if (onChange !== undefined) {
            onChange(e.target.value);
          }
        }}
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
  const system = useSystemContext();
  const ProcessBackground = useBackgroundVideo();
  const ProcessMusic = useBackgroundMusic();
  const language = browserLanguage;
  const ProcessVideoPodcast = useProcessPodcast();
  const [type, setType] = useState<
    '' | 'podcast_script' | 'local_link_podcast' | 'local_link_podcast_video'
  >('');
  const [backgroundSelected, setBackgroundSelected] =
    useState<BackgroundVideoType | null>(null);
  const [musicSelected, setMusicSelected] =
    useState<BackgroundMusicType | null>(null);

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
  // const videoBackgrounds = [
  //   'car',
  //   'cosmos',
  //   'galaxy',
  //   'matrix',
  //   'minecraft-1',
  //   'minecraft-2',
  //   'minecraft-3',
  //   'space',
  // ];

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

  useEffect(() => {
    ProcessBackground.GetAll();
    ProcessMusic.GetAllMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box display="flex" alignItems="end">
          <PodcastScript />
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
          {video.attributes.local_link_podcast ? (
            <>
              <Box width={10} flexShrink={0} />
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
                  <>Video</>
                ) : null}
              </Button>
            </>
          ) : null}
        </Box>
        {ProcessVideoPodcast.isLoading ||
        isLoading(video.attributes.local_link_podcast) ||
        isLoading(video.attributes.local_link_podcast_video) ? (
          <Box width="100%" marginTop={0.5} marginBottom={0.5}>
            <LinearProgress />
          </Box>
        ) : null}
      </Box>

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
                    const videoBackgroundSelected =
                      formData.get('videoBackground')?.toString().trim() ?? '';
                    const videoBackground = system.state.backgroundVideos.find(
                      (i) => i.attributes.name === videoBackgroundSelected
                    )?.attributes?.local_link;

                    const videoMusicSelected =
                      formData.get('videoMusic')?.toString().trim() ?? '';
                    const videoMusic =
                      system.state.backgroundMusic.find(
                        (i) => i.attributes.name === videoMusicSelected
                      )?.attributes?.local_link ?? '';

                    const musicVolume = Number(
                      formData.get('musicVolume')?.toString().trim() ?? 8
                    );

                    if (!videoBackgroundSelected) {
                      return;
                    }

                    ProcessVideoPodcast.video({
                      video,
                      videoBackground,
                      videoMusic,
                      musicVolume,
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
                      options={system.state.backgroundVideos
                        .filter((i) =>
                          ProcessBackground.isCompleted(i.attributes.status)
                        )
                        .map((i) => i.attributes.name)}
                      onChange={(value) => {
                        const backgroundSelected =
                          system.state.backgroundVideos.find(
                            (i) => value === i.attributes.name
                          );
                        if (backgroundSelected) {
                          setBackgroundSelected(backgroundSelected);
                        }
                      }}
                    />
                    <Divisor />
                    {backgroundSelected ? (
                      <>
                        <Box display="flex" justifyContent="center">
                          <Box width={200} height={200}>
                            <SSRPlayer
                              link={`${domainURL}/${backgroundSelected.attributes.local_link}`}
                              height="100%"
                              playing={false}
                            />
                          </Box>
                        </Box>
                        <Divisor />
                      </>
                    ) : null}
                    <DropDown
                      label={
                        language === 'en' ? 'Video music' : 'Musica del video'
                      }
                      name="videoMusic"
                      options={system.state.backgroundMusic
                        .filter((i) =>
                          ProcessMusic.RequestCompleted(i.attributes.status)
                        )
                        .map((i) => i.attributes.name)}
                      onChange={(value) => {
                        const musicSelected = system.state.backgroundMusic.find(
                          (i) => value === i.attributes.name
                        );
                        if (musicSelected) {
                          setMusicSelected(musicSelected);
                        }
                      }}
                    />
                    <Divisor />
                    {musicSelected ? (
                      <>
                        <SSRPlayer
                          link={`${domainURL}/${musicSelected.attributes.local_link}`}
                          height={55}
                          playing={false}
                        />
                        <Divisor />
                      </>
                    ) : null}
                    <TextField
                      label={
                        language === 'en'
                          ? 'Volumen de la musica (0-100)'
                          : 'Music volume (0-100)'
                      }
                      placeholder={
                        language === 'en'
                          ? 'Volumen de la musica (0-100)'
                          : 'Music volume (0-100)'
                      }
                      size="small"
                      name="musicVolume"
                      type="text"
                      defaultValue={8}
                      fullWidth
                      required
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
