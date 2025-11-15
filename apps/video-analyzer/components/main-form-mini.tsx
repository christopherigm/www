'use client';

import React, { FormEvent, useRef, useState } from 'react';
import Languages from '@repo/interfaces/languages';
import Typography from '@mui/material/Typography';
import Divisor from '@repo/ui/divisor';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import isYoutube from '@repo/helpers/is-youtube-checker';
import isFacebook from '@repo/helpers/is-facebook-checker';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isInstagram from '@repo/helpers/is-instagram-checker';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import Switch from '@repo/ui/generic-switch';
import UseVideoDetails from './video-details';
import SendIcon from '@mui/icons-material/Send';
import LinearProgress from '@mui/material/LinearProgress';
import TranslucentPaper from '@repo/ui/translucent-paper';
import RecordedPrompts from '@/components/recorded-prompts';
import useProcessPrompt from '@/state/process-prompt';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import IconButton from '@mui/material/IconButton';
import { DefaultVideo } from '@/state/video-type';
import { useVideoContext } from '@/state/video-reducer';

const MainFormMini = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const { dispatch } = useVideoContext();
  const language = browserLanguage as Languages;
  const formRef = useRef<HTMLFormElement>(null);
  const [addPrompt, setAddPrompt] = useState<boolean>(false);
  const [link, setLink] = useState<string>('');

  const ProcessPrompt = useProcessPrompt();
  const VideoDetails = UseVideoDetails(link);
  const validURL =
    isYoutube(link) || isTiktok(link) || isFacebook(link) || isInstagram(link);

  const submit = (prompt: string) => {
    const attributes = {
      link,
      language,
      ...(VideoDetails.title && {
        name: VideoDetails.title?.substring(0, 254),
      }),
      ...(VideoDetails.thumbnail && {
        thumbnail: VideoDetails.thumbnail,
      }),
      ...(VideoDetails.captionSelected &&
        VideoDetails.captionSelected !== 'auto' && {
          requested_captions_language: VideoDetails.captionSelected,
        }),
      ...(VideoDetails.subtitleSelected &&
        VideoDetails.subtitleSelected !== 'auto' && {
          requested_subtitles_language: VideoDetails.subtitleSelected,
        }),
    };
    ProcessPrompt.exec({
      video: DefaultVideo,
      prompt,
      attributes,
      CallBack: (rawData) => dispatch({ type: 'set-data', rawData }),
    });
  };

  return (
    <form
      ref={formRef}
      noValidate={false}
      autoComplete="on"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const prompt = formData.get('prompt')?.toString().trim() ?? '';
        submit(prompt);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TranslucentPaper>
        <Box padding={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              onChange={(e) => setLink(e.target.value)}
              placeholder={language === 'en' ? 'Video Link' : 'Link del video'}
              size="small"
              name="link"
              type="url"
              disabled={ProcessPrompt.isLoading || VideoDetails.isLoading}
              fullWidth
              required
            />
            <Box width={10} flexShrink={0} />
            <IconButton
              aria-label="send"
              size="small"
              color="success"
              type="submit"
              style={{
                width: 35,
                height: 35,
                boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
              }}
              disabled={
                !validURL || VideoDetails.isLoading || ProcessPrompt.isLoading
              }
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
          {validURL && !VideoDetails.isLoading ? (
            <>
              {VideoDetails.AutomaticCaptionsDropDown ||
              VideoDetails.SubtitlesDropDown ? (
                <>
                  <Divisor />
                  <Box display="flex" justifyContent="space-between">
                    {VideoDetails.AutomaticCaptionsDropDown}
                    <Box width={10} />
                    {VideoDetails.SubtitlesDropDown}
                    <Box flexGrow={1} />
                  </Box>
                </>
              ) : null}
              <HorizontalDivisor margin={1} />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">
                  {language === 'en'
                    ? 'Ask anything about the video'
                    : 'Preguntar algo del video?'}
                </Typography>
                <Box width={15} />
                <Switch
                  language={language}
                  value={addPrompt}
                  onChange={(value) => setAddPrompt(value)}
                  disabled={
                    !validURL ||
                    VideoDetails.isLoading ||
                    ProcessPrompt.isLoading
                  }
                />
              </Box>
              {addPrompt ? (
                <TextField
                  placeholder={
                    language === 'en'
                      ? 'Your question o request'
                      : 'Tu pregunta o peticion'
                  }
                  size="small"
                  name="prompt"
                  type="text"
                  disabled={VideoDetails.isLoading || ProcessPrompt.isLoading}
                  multiline={true}
                  maxRows={4}
                  fullWidth
                  required
                />
              ) : null}
              <HorizontalDivisor margin={1} />
              <RecordedPrompts
                showList={false}
                sendCallback={(prompt: string) => {
                  if (prompt) {
                    submit(prompt);
                  }
                }}
              />
            </>
          ) : null}
          {VideoDetails.isLoading || ProcessPrompt.isLoading ? (
            <Box width="100%" marginTop={1}>
              <LinearProgress />
            </Box>
          ) : null}
        </Box>
      </TranslucentPaper>
    </form>
  );
};

export default MainFormMini;
