'use client';

import { useState } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import MUISizes from '../mui-sizes';
import Typography from '@mui/material/Typography';

export type objectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export type GenericImageProps = {
  id?: number;
  uuid?: string;
  img_picture?: string;
  name?: string;
  href?: string;
  fit?: objectFit;
  background_color?: string;
  rawItem?: any;
};

type ImageProps = {
  width?: MUISizes;
  height?: MUISizes;
  blurOverlay?: number;
  borderRadius?: number;
  boxShadow?: string;
  imgLoading?: 'eager' | 'lazy';
  nameBottom?: number;
  namePosition?: 'center' | 'left' | 'right';
  opacity?: number;
  quality?: number;
  unoptimized?: boolean;
} & GenericImageProps;

const GenericImage = ({
  width = {
    xs: '100%',
  },
  height = {
    xs: 350,
    sm: 450,
    md: 350,
  },
  img_picture,
  name,
  blurOverlay = 0,
  fit = 'cover',
  background_color = '',
  borderRadius = 0,
  boxShadow = '',
  imgLoading = 'lazy',
  nameBottom = 0,
  namePosition = 'center',
  opacity = 1,
  quality = 100,
  unoptimized = false,
}: ImageProps) => {
  const [loading, setLoading] = useState<boolean>(true);

  if (!img_picture) {
    return <></>;
  }

  return (
    <Box
      className={
        loading ? 'GenericImage GenericImage__loading' : 'GenericImage'
      }
      position="relative"
      width={width}
      height={height}
      bgcolor={background_color}
      borderRadius={borderRadius}
      overflow="hidden"
      boxShadow={boxShadow}
    >
      <Image
        loading={imgLoading}
        src={img_picture}
        fill={true}
        style={{
          opacity: opacity ?? 1,
          objectFit: fit,
        }}
        alt={name || ''}
        onLoad={() => setLoading(false)}
        quality={quality ?? 100}
        // sizes="(max-width: 768px) 100vw, (max-width: 2048px) 50vw, 33vw"
        unoptimized={unoptimized}
      />
      {name ? (
        <Box
          width="100%"
          height="auto"
          bottom={nameBottom}
          left={0}
          position="absolute"
          padding={1}
          bgcolor="rgba(0,0,0,0.4)"
        >
          <Typography variant="body1" color="#fff" textAlign={namePosition}>
            {name}
          </Typography>
        </Box>
      ) : null}
      {blurOverlay ? (
        <Box
          width="100%"
          height="100%"
          top={0}
          left={0}
          position="absolute"
          sx={{
            backdropFilter: `blur(${blurOverlay}px)`,
          }}
        ></Box>
      ) : null}
    </Box>
  );
};

export default GenericImage;

// https://youtu.be/hJ7Rg1821Q0
