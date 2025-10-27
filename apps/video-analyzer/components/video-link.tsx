'use client';

import React from 'react';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ButtonToCopy from '@repo/ui/button-to-copy';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

type Props = {
  link?: string;
  href?: string;
  displayCopyButton?: boolean;
  displayOpenButton?: boolean;
};

const VideoLink = ({
  link,
  href,
  displayCopyButton = false,
  displayOpenButton = false,
}: Props) => {
  if (!link) {
    return;
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
        <Link href={href ?? link}>{link}</Link>
      </Typography>
      <Box display="flex">
        {displayOpenButton ? (
          <>
            <Box width={10} flexShrink={0} />
            <IconButton
              aria-label="expand"
              size="small"
              color="success"
              href={href ?? link}
              target="_blank"
              style={{
                width: 35,
                height: 35,
                boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </>
        ) : null}
        {displayCopyButton ? (
          <>
            <Box width={10} flexShrink={0} />
            <ButtonToCopy text={link} />
          </>
        ) : null}
      </Box>
    </Box>
  );
};

export default VideoLink;
