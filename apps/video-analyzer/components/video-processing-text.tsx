'use client';

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useVideoContext } from '@/state/video-reducer';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import VideoErrorText from '@/components/video-error-text';

const VideoProcessingText = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const { video } = useVideoContext();

  if (video.isLoading || video.attributes.status === 'processing') {
    return (
      <Box display="flex" flexDirection="column">
        <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
          {language === 'en'
            ? 'Processing video...💻 🎧'
            : 'Procesando video...💻 🎧'}
        </Typography>
        <Box width="100%" marginTop={1}>
          <LinearProgress />
        </Box>
      </Box>
    );
  }

  if (video.attributes.status === 'error') {
    return (
      <>
        <HorizontalDivisor margin={1} />
        <VideoErrorText language={language} />
      </>
      // <Box display="flex" flexDirection="column">
      //   <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
      //     {language === 'en'
      //       ? 'Error processing video... 🙈😢'
      //       : 'Error procesando video... 🙈😢'}
      //   </Typography>
      // </Box>
    );
  }

  return null;
};

export default VideoProcessingText;
