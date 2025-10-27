'use client';

import React from 'react';
import Box from '@mui/material/Box';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import ButtonToCopy from '@repo/ui/button-to-copy';
import ButtonToDownloadText from '@repo/ui/button-to-download-text';
import { useVideoContext } from '@/state/video-reducer';
import Typography from '@mui/material/Typography';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';

type ItemProps = {
  label: string;
  text: string;
  isLoading: boolean;
};

const Item = ({ label, text, isLoading = false }: ItemProps) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body1">{label}</Typography>
      <Box display="flex">
        <ButtonToCopy text={text} isLoading={isLoading} />
        <Box width={10} flexShrink={0} />
        <ButtonToDownloadText text={text} isLoading={isLoading} />
      </Box>
    </Box>
  );
};

const TranscriptionsTable = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const { video } = useVideoContext();
  const transcriptions = video.attributes.transcriptions;
  const clean_transcriptions = video.attributes.clean_transcriptions;

  if (!transcriptions && !clean_transcriptions) {
    return null;
  }

  return (
    <>
      <HorizontalDivisor margin={1} />
      <Item
        label={language === 'en' ? 'Transcriptions' : 'Transcripciones'}
        text={clean_transcriptions}
        isLoading={video.isLoading}
      />
      <HorizontalDivisor margin={1} />
      <Item
        label={language === 'en' ? 'SRT Transcriptions' : 'Transcripciones SRT'}
        text={transcriptions}
        isLoading={video.isLoading}
      />
    </>
  );
};

export default TranscriptionsTable;
