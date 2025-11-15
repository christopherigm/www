'use client';

import React, { FormEvent, useRef } from 'react';
import Box from '@mui/material/Box';
import Divisor from '@repo/ui/divisor';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DescriptionIcon from '@mui/icons-material/Description';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import { useVideoContext } from '@/state/video-reducer';
import useProcessPodcast, { LinkType } from '@/state/process-video-podcast';
import { VideoType } from '@/state/video-type';
import GenericSelector from '@repo/ui/generic-selector';
import useModal from '@repo/ui/use-modal';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

const PodcastScript = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const { video, dispatch } = useVideoContext();
  const ProcessVideoPodcast = useProcessPodcast();
  const language = browserLanguage;
  const formRef = useRef<HTMLFormElement>(null);
  const Modal = useModal();
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('>>> formRef', formRef.current?.checkValidity());
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() ?? '';
    const speaker1 = formData.get('user_1')?.toString().trim() ?? 'Chris';
    const speaker2 = formData.get('user_2')?.toString().trim() ?? 'Brandon';
    const speakers = [speaker1, speaker2].filter((i) => i !== '');
    const mood = formData.get('mood')?.toString().trim() ?? '';
    const language = formData.get('podcastLanguage')?.toString().trim() ?? '';
    const match = podcastLanguages.find((v) => v.name === language);
    const codeLanguage = match?.code ?? '';
    if (!codeLanguage || !language) {
      return;
    }
    Modal.setOpen(false);
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
      doneCallBack: (link) => doneCallBack(video, 'podcast_script', link),
      progressCallBack: (v) => progressCallBack(video, 'podcast_script', v),
    });
  };

  return (
    <>
      <Modal.Component
        title={
          language === 'en' ? 'Create Podcast Script' : 'Crear Podcast Script'
        }
      >
        <form onSubmit={onSubmit} ref={formRef}>
          <GenericSelector
            label={{
              en: 'Podcast language',
              es: 'Idioma del podcast',
            }}
            language={language}
            options={podcastLanguages.map((i) => {
              return {
                value: i.name,
                label: {
                  en: i.name,
                  es: i.name,
                },
              };
            })}
            defaultValue="en"
            name="podcastLanguage"
          />
          <Divisor />
          <TextField
            label={language === 'en' ? 'Podcast name' : 'Nombre del podcast'}
            size="small"
            name="name"
            type="text"
            fullWidth
          />
          <Divisor />
          <TextField
            label={language === 'en' ? 'Podcast mood' : 'Tono del podcast'}
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
        </form>
      </Modal.Component>
      <Button
        variant="contained"
        color="inherit"
        endIcon={
          <DescriptionIcon
            color={
              video.attributes.podcast_script === 'error' ? 'error' : 'success'
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
        onClick={() => Modal.setOpen(true)}
        fullWidth
      >
        {video.attributes.podcast_script &&
        video.attributes.podcast_script !== 'processing' ? (
          <>{language === 'en' ? 'Script' : 'Script'}</>
        ) : (
          <>{language === 'en' ? 'Script' : 'Script'}</>
        )}
      </Button>
    </>
  );
};

export default PodcastScript;
