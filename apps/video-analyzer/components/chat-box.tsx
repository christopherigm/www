'use client';

import React, { FormEvent, ReactNode, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import { useVideoContext } from '@/state/video-reducer';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import GetEnvVariables from '@repo/helpers/get-env-variables';
import { useColorScheme } from '@mui/material/styles';
import useProcessPrompt from '@/state/process-prompt';
import ScrollToBottom from '@repo/ui/scroll-to-bottom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const ChatBoxForm = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const { video, dispatch } = useVideoContext();
  const { mode } = useColorScheme();
  const theme = useTheme();
  const language = browserLanguage;
  const formRef = useRef<HTMLFormElement>(null);
  const env = GetEnvVariables();

  const ProcessPrompt = useProcessPrompt();
  const matches = useMediaQuery(theme.breakpoints.not('xs'));

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <>{matches ? <Container>{children}</Container> : <>{children}</>}</>;
  };

  return (
    <Box
      position="fixed"
      bottom={{
        xs: 0,
        sm: 66,
      }}
      left={0}
      width="100%"
    >
      <Wrapper>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 5 }}></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 7 }}>
            <form
              ref={formRef}
              autoComplete="on"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);
                const prompt = formData.get('prompt')?.toString().trim();
                if (prompt) {
                  // ProcessRequest(prompt);
                  ProcessPrompt.exec({
                    video,
                    prompt,
                    CallBack: (rawData) => {
                      console.log('callback!', rawData);
                      dispatch({ type: 'patch-data', rawData });
                      ScrollToBottom();
                    },
                  });
                  if (formRef && formRef.current) {
                    formRef.current.reset();
                  }
                }
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                padding: '7px 7px 10px 7px',
                backgroundColor:
                  mode === 'dark' ? '#111' : (env.bodyBGColor ?? '#777'),
                borderRadius: '5px 5px 0 0',
                border: `1px solid ${mode === 'dark' ? '#444' : '#aaa'}`,
              }}
            >
              <TextField
                placeholder={
                  language === 'en'
                    ? 'Ask a question o request'
                    : 'Hacer una pregunta o peticion'
                }
                size="small"
                name="prompt"
                disabled={ProcessPrompt.isLoading}
                multiline={true}
                maxRows={4}
                fullWidth
                required
              />
              <Box width={10} />
              <Box width={40} height={40}>
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
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Wrapper>
    </Box>
  );
};

export default ChatBoxForm;
