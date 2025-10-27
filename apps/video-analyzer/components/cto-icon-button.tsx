'use client';

import React, { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import LinearProgress from '@mui/material/LinearProgress';

type Props = {
  children: ReactNode;
  link: string;
  label: string;
  showLabel?: boolean;
  disabled?: boolean;
  activeLink?: string;
  onClick: () => void;
  onDoubleClick?: () => void;
};

const CTOIconButton = ({
  children,
  link,
  label,
  showLabel = false,
  disabled = false,
  activeLink = '',
  onClick,
  onDoubleClick,
}: Props) => {
  const width = showLabel ? 65 : 'auto';
  const isActiveLink = (): boolean =>
    link !== null &&
    link !== '' &&
    activeLink !== null &&
    activeLink !== '' &&
    link === activeLink;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width={width}
    >
      <IconButton
        aria-label={label}
        size="small"
        color={
          link === 'error' ? 'error' : isActiveLink() ? 'success' : 'default'
        }
        style={{
          width: 35,
          height: 35,
          boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
          backgroundColor: isActiveLink() ? 'rgba(255, 255, 255, 1)' : '',
        }}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        disabled={disabled || link === 'processing'}
      >
        {children}
      </IconButton>
      {link === 'processing' ? (
        <Box width="100%" marginTop={0.5} marginBottom={0.5}>
          <LinearProgress />
        </Box>
      ) : null}
      {showLabel ? (
        <>
          {link !== 'processing' ? <HorizontalDivisor margin={0.5} /> : null}
          <Typography
            variant="body2"
            textAlign="center"
            style={{
              lineBreak: 'auto',
              width: width,
            }}
          >
            {label}
          </Typography>
        </>
      ) : null}
    </Box>
  );
};

export default CTOIconButton;
