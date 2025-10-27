'use client';

import React, { memo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useVideoContext } from '@/state/video-reducer';
import GetDomainURLFromEnv from '@repo/helpers/get-domain-url';
import isYoutube from '@repo/helpers/is-youtube-checker';
import Box from '@mui/material/Box';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import IconButton from '@mui/material/IconButton';

const domainURL = GetDomainURLFromEnv();

type BaseProps = {
  height?: number;
  playing?: boolean;
};

type PlayerProps = {
  link: string;
} & BaseProps;

const Player = ({ link, height = 350, playing = true }: PlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isJustAudio = link.search('.wav') > -1;

  setTimeout(() => {
    if (videoRef && videoRef.current && playing) {
      videoRef.current.play();
    }
  }, 1000);

  return (
    <Box
      height={isYoutube(link) ? 220 : isJustAudio ? 55 : 350}
      width="100%"
      position="relative"
    >
      <ReactPlayer
        ref={videoRef}
        src={`${domainURL}/${link.replaceAll('/media/', 'media/')}`}
        width="100%"
        height={isYoutube(link) ? 220 : isJustAudio ? 55 : height}
        style={{
          backgroundColor: 'rgba(28, 28, 28, 0.4)',
          backdropFilter: 'blur(10px)',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          overflow: 'hidden',
        }}
        controls
        loop
      />
      {!isJustAudio && !isYoutube(link) ? (
        <Box position="absolute" top={7} right={7}>
          <IconButton
            aria-label="pip"
            size="small"
            color="error"
            type="submit"
            style={{
              width: 35,
              height: 35,
              boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
            onClick={() => {
              if (videoRef && videoRef.current) {
                videoRef.current.requestPictureInPicture();
              }
            }}
          >
            <PictureInPictureIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : null}
    </Box>
  );
};

const PlayerMemo = memo(Player);

const PlayerWrapper = ({ height, playing }: BaseProps) => {
  const { video } = useVideoContext();
  const finalLink =
    video.activeLink !== '' ? video.activeLink : video.attributes.local_link;

  if (!finalLink && finalLink !== 'processing' && finalLink !== 'error') {
    return null;
  }
  return <PlayerMemo link={finalLink} height={height} playing={playing} />;
};

export default PlayerWrapper;
