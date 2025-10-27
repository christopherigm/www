'use client';

import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import copy from 'copy-to-clipboard';

type Props = {
  text?: string;
  isLoading?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
};

const ButtonToCopy = ({
  text,
  isLoading = false,
  backgroundColor,
  size = 'small',
}: Props) => {
  if (!text) {
    return;
  }

  return (
    <IconButton
      aria-label="copy"
      size={size}
      color="info"
      onClick={() => copy(text)}
      disabled={isLoading}
      style={{
        width: size === 'small' ? 35 : 40,
        height: size === 'small' ? 35 : 40,
        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
        backgroundColor,
      }}
    >
      <ContentCopyIcon fontSize={size} />
    </IconButton>
  );
};

export default ButtonToCopy;
