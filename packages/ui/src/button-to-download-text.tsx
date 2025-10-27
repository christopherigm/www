'use client';

import React from 'react';
import IconButton from '@mui/material/IconButton';

import DownloadIcon from '@mui/icons-material/Download';

type Props = {
  text?: string;
  isLoading?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
};

const ButtonToDownloadText = ({
  text,
  isLoading = false,
  backgroundColor,
  size = 'small',
}: Props) => {
  if (!text) {
    return;
  }

  const genText = (text: string) => {
    const blob = new Blob([text], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'transcriptions.txt';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <IconButton
      aria-label="copy"
      size={size}
      color="success"
      onClick={() => genText(text)}
      disabled={isLoading}
      style={{
        width: size === 'small' ? 35 : 40,
        height: size === 'small' ? 35 : 40,
        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
        backgroundColor,
      }}
    >
      <DownloadIcon fontSize={size} />
    </IconButton>
  );
};

export default ButtonToDownloadText;
