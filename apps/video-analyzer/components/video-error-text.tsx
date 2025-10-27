import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Languages from '@repo/interfaces/languages';

type Props = {
  language?: Languages;
};

const VideoErrorText = ({ language = 'en' }: Props) => {
  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
        {language === 'en'
          ? 'Error reading the video or extracting transcriptions 😢'
          : 'Error leyendo el video y/o extrayendo las transcripciones 😢'}
      </Typography>
    </Box>
  );
};

export default VideoErrorText;
