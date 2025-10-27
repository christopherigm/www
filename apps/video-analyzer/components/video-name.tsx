import React from 'react';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

type Props = {
  name?: string;
  href?: string;
};

const VideoName = ({ name, href }: Props) => {
  return (
    <Typography
      variant="body1"
      fontWeight="bold"
      style={{ wordBreak: 'break-all' }}
    >
      {href ? <Link href={href}>{name}</Link> : name}
    </Typography>
  );
};

export default VideoName;
