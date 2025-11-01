'use client';

import { useState } from 'react';
import { useSystemContext } from '@/state/system-reducer';
import Box from '@mui/material/Box';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import Languages from '@repo/interfaces/languages';
import Button from '@mui/material/Button';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import TranslucentPaper from '@repo/ui/translucent-paper';
import AssetsFormBackground from '@/components/assets-form-background-video';
import Container from '@mui/material/Container';
import LocalBackgroundVideos from '@/components/local-background-videos';
import AssetsFormMusic from '@/components/assets-form-music';
import LocalMusic from '@/components/local-music';

const AssetsForm = () => {
  const { state } = useSystemContext();
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage as Languages;
  const [selected, setSelected] = useState<'' | 'backgrounds' | 'music'>(
    'backgrounds'
  );

  if (state.animatedBackground === undefined) {
    return null;
  }

  return (
    <>
      <Container maxWidth="xs">
        <TranslucentPaper>
          <Box display="flex" flexDirection="column" padding={1}>
            <Box display="flex">
              <Button
                variant={selected === 'backgrounds' ? 'contained' : 'text'}
                color="inherit"
                endIcon={
                  <WallpaperIcon
                    color={selected === 'backgrounds' ? 'success' : 'inherit'}
                  />
                }
                sx={{
                  textTransform: 'initial',
                }}
                onClick={() => setSelected('backgrounds')}
                fullWidth
              >
                {language === 'en' ? 'Videos' : 'Videos'}
              </Button>
              <Box width={10} flexShrink={0} />
              <Button
                variant={selected === 'music' ? 'contained' : 'text'}
                color="inherit"
                endIcon={
                  <LibraryMusicIcon
                    color={selected === 'music' ? 'success' : 'inherit'}
                  />
                }
                sx={{
                  textTransform: 'initial',
                }}
                onClick={() => setSelected('music')}
                fullWidth
              >
                {language === 'en' ? 'Music' : 'Musica'}
              </Button>
            </Box>
          </Box>
        </TranslucentPaper>
      </Container>

      {selected === 'backgrounds' ? (
        <>
          <Container maxWidth="xs">
            <AssetsFormBackground />
          </Container>
          <Container maxWidth="lg">
            <LocalBackgroundVideos />
          </Container>
        </>
      ) : null}

      {selected === 'music' ? (
        <>
          <Container maxWidth="xs">
            <AssetsFormMusic />
          </Container>
          <Container maxWidth="lg">
            <LocalMusic />
          </Container>
        </>
      ) : null}
    </>
  );
};

export default AssetsForm;
