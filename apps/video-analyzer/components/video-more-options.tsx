'use client';

import React from 'react';
import Box from '@mui/material/Box';

import DragHandleIcon from '@mui/icons-material/DragHandle';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import TranscriptionsTable from '@/components/transcription-table';
import { useVideoContext } from '@/state/video-reducer';
import VideoLink from '@/components/video-link';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';

type Props = {
  showMoreOptions: boolean;
  setShowMoreOptions: (value: boolean) => void;
};

const VideoMoreOptions = ({ showMoreOptions, setShowMoreOptions }: Props) => {
  const { video } = useVideoContext();

  return (
    <>
      {showMoreOptions ? (
        <>
          <HorizontalDivisor margin={1} />
          <VideoLink
            link={video.attributes.link}
            displayCopyButton
            displayOpenButton
          />
          <TranscriptionsTable />
        </>
      ) : null}
      <Box display="flex" flexDirection="column" justifyContent="center">
        <Button
          size="small"
          color="inherit"
          onClick={() => setShowMoreOptions(!showMoreOptions)}
        >
          {showMoreOptions ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <DragHandleIcon fontSize="small" />
          )}
        </Button>
      </Box>
    </>
  );
};

export default VideoMoreOptions;
