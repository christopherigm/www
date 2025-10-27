'use client';

import Paper from '@mui/material/Paper';
import { useColorScheme } from '@mui/material/styles';
import { ReactElement, ReactNode } from 'react';

type Props = {
  children: ReactElement | ReactNode;
  borderRadius?: string | number;
};

const TranslucentPaper = ({ children, borderRadius }: Props) => {
  const { mode } = useColorScheme();

  const color =
    mode === 'light' ? 'rgba(224, 224, 224, 0.41)' : 'rgba(28, 28, 28, 0.36)';

  return (
    <Paper
      elevation={2}
      sx={{
        background: color,
        '--bg-currentcolor': color,
        backdropFilter: 'blur(10px)',
        borderRadius,
      }}
    >
      {children}
    </Paper>
  );
};

export default TranslucentPaper;
