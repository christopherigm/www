'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSystemContext } from '@/state/system-reducer';
import Box from '@mui/material/Box';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import Languages from '@repo/interfaces/languages';
import TranslucentPaper from '@repo/ui/translucent-paper';
import Divisor from '@repo/ui/divisor';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import isYoutube from '@repo/helpers/is-youtube-checker';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isFacebook from '@repo/helpers/is-facebook-checker';
import isInstagram from '@repo/helpers/is-instagram-checker';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import useBackgroundMusic from '@/state/use-background-music';

const AssetsFormMusic = () => {
  const { state } = useSystemContext();
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage as Languages;
  const [increaseFPS, setIncreaseFPS] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [link, setLink] = useState<string>('');
  const validURL =
    isYoutube(link) || isTiktok(link) || isFacebook(link) || isInstagram(link);
  const ProcessMusic = useBackgroundMusic();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const link = formData.get('link')?.toString().trim() ?? '';
    const timeLength = formData.get('timeLength')?.toString().trim() ?? '30';
    const transitionDuration =
      formData.get('transitionDuration')?.toString().trim() ?? '0';

    if (link && timeLength) {
      const data = {
        url: link,
        timeLength: Number(timeLength),
        transitionDuration: Number(transitionDuration),
        upscaleFPS: increaseFPS ? 60 : 0,
      };
      ProcessMusic.CreateMusic({
        ...data,
        doneCallBack: (music) => {
          console.log('Complete!', music);
          // ProcessMusic.GetAllMusic();
        },
      });
      if (formRef.current) {
        formRef.current.reset();
        setIncreaseFPS(false);
      }
    }
  };

  useEffect(() => {
    ProcessMusic.GetAllMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.animatedBackground === undefined) {
    return null;
  }

  return (
    <>
      <Divisor />
      <TranslucentPaper>
        <Box display="flex" flexDirection="column" padding={1}>
          <form
            ref={formRef}
            noValidate={false}
            autoComplete="on"
            onSubmit={onSubmit}
          >
            <TextField
              onChange={(e) => setLink(e.target.value)}
              label={language === 'en' ? 'Video Link' : 'Link del video'}
              placeholder={language === 'en' ? 'Video Link' : 'Link del video'}
              size="small"
              name="link"
              type="url"
              fullWidth
              required
            />
            <Divisor height={10} />
            <TextField
              label={
                language === 'en'
                  ? 'Desaired duration (sec)'
                  : 'Duracion deseada (seg)'
              }
              placeholder={
                language === 'en'
                  ? 'Desaired duration (sec)'
                  : 'Duracion deseada (seg)'
              }
              size="small"
              name="timeLength"
              type="number"
              defaultValue={300}
              fullWidth
              required
            />
            <HorizontalDivisor margin={1} />
            <Box display="flex" justifyContent="end">
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
                disabled={!validURL}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </form>
        </Box>
      </TranslucentPaper>
    </>
  );
};

export default AssetsFormMusic;
