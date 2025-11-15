'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import Divisor from '@repo/ui/divisor';
import Typography from '@mui/material/Typography';
import Markdown from 'react-markdown';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import useProcessPodcast from '@/state/process-video-podcast';
import { useVideoContext } from '@/state/video-reducer';
import { VideoType } from '@/state/video-type';

type BubbleProps = {
  label: string;
  text: string;
  type: 'left' | 'right';
  isLoading?: boolean;
  onEdit: (newText: string) => void;
  onDelete: () => void;
};

const Bubble = ({
  label,
  text,
  type,
  isLoading = false,
  onEdit,
  onDelete,
}: BubbleProps) => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const [newText, setNewText] = useState<string>('');

  return (
    <Box
      display="flex"
      flexDirection="column"
      paddingX={1.5}
      paddingY={1}
      className={`bubble ${type}`}
    >
      <Box>
        <Typography variant="caption">{label}</Typography>
        <Markdown>{text}</Markdown>
      </Box>
      <Box>
        <HorizontalDivisor margin={1} />
      </Box>
      <Box display="flex" justifyContent="space-between">
        <IconButton
          aria-label="delete"
          size="small"
          onClick={() => onDelete()}
          color="error"
          disabled={isLoading}
          style={{
            width: 35,
            height: 35,
            boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
            backgroundColor: 'rgba(0, 0, 0, 0.57)',
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton
          aria-label="edit"
          size="small"
          onClick={() => setNewText(text)}
          color="warning"
          disabled={isLoading}
          style={{
            width: 35,
            height: 35,
            boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
            backgroundColor: 'rgba(0, 0, 0, 0.57)',
          }}
        >
          <EditDocumentIcon fontSize="small" />
        </IconButton>
      </Box>
      <Modal
        open={newText !== ''}
        onClose={() => setNewText('')}
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
                  {language === 'en'
                    ? 'Edit interaction'
                    : 'Editar interaccion'}
                </Typography>
                <IconButton
                  aria-label="close"
                  size="small"
                  onClick={() => setNewText('')}
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
                  const text = formData.get('text')?.toString().trim() ?? '';
                  onEdit(text);
                  setNewText('');
                }}
              >
                <Divisor height={5} />
                <TextField
                  label={language === 'en' ? 'Text' : 'Texto'}
                  size="small"
                  name="text"
                  type="text"
                  minRows={4}
                  maxRows={10}
                  defaultValue={newText}
                  multiline
                  fullWidth
                />
                <Divisor />
                <Button
                  variant="contained"
                  color="success"
                  endIcon={<SendAndArchiveIcon />}
                  sx={{
                    textTransform: 'initial',
                  }}
                  type="submit"
                  fullWidth
                >
                  {language === 'en' ? 'Accept' : 'Aceptar'}
                </Button>
              </form>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export type PodcastInteraction = {
  speakerID: number;
  text: string;
};

type Props = {
  podcastScript: Array<PodcastInteraction>;
};

const PodcastScriptInteractions = ({ podcastScript }: Props) => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const { video, dispatch } = useVideoContext();
  const ProcessVideoPodcast = useProcessPodcast();

  const doneCallBack = (video: VideoType) => {
    dispatch({ type: 'patch-data', rawData: video });
  };

  const editText = (index: number, text: string) => {
    const newValue = podcastScript.map((i: PodcastInteraction, idx: number) => {
      if (idx === index) {
        return {
          ...i,
          text,
        };
      }
      return i;
    });
    ProcessVideoPodcast.updateScript({
      id: video.id,
      attributes: {
        podcast_script: JSON.stringify(newValue),
      },
      doneCallBack: () => doneCallBack(video),
    });
  };

  const onDelete = (index: number) => {
    const newValue = [...podcastScript];
    newValue.splice(index, 1);
    ProcessVideoPodcast.updateScript({
      id: video.id,
      attributes: {
        podcast_script: JSON.stringify(newValue),
      },
      doneCallBack: () => doneCallBack(video),
    });
  };

  return (
    <Box display="flex" flexDirection="column">
      {podcastScript.map((interaction: PodcastInteraction, index: number) => {
        return (
          <Box key={index} display="flex" flexDirection="column">
            {interaction.speakerID === 1 ? (
              <Box display="flex" justifyContent="end">
                <Bubble
                  label={language === 'en' ? 'User 1:' : 'Usuario 1:'}
                  text={interaction.text}
                  type="right"
                  onEdit={(newText: string) => editText(index, newText)}
                  onDelete={() => onDelete(index)}
                />
              </Box>
            ) : (
              <>
                <Box display="flex" justifyContent="start">
                  <Bubble
                    label={language === 'en' ? 'User 2:' : 'Usuario 2:'}
                    text={interaction.text}
                    type="left"
                    onEdit={(newText: string) => editText(index, newText)}
                    onDelete={() => onDelete(index)}
                  />
                </Box>
              </>
            )}
            <Divisor />
          </Box>
        );
      })}
    </Box>
  );
};

export default PodcastScriptInteractions;
