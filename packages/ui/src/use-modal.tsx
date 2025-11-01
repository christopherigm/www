'use client';

import React, { ReactNode, useState } from 'react';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import Box from '@mui/material/Box';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';

type Props = {
  children: ReactNode | Array<ReactNode>;
  title: string;
};

const useModal = () => {
  const [open, setOpen] = useState<boolean>(false);

  const Component = ({ children, title }: Props) => (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <Box width="100%" maxWidth={600} padding={2}>
        <Paper elevation={2}>
          <Box padding={1} display="flex" flexDirection="column">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body1" fontWeight="bold">
                {title}
              </Typography>
              <IconButton
                aria-label="close"
                size="small"
                onClick={() => setOpen(false)}
                color="error"
                style={{
                  width: 35,
                  height: 35,
                  boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                }}
              >
                <CloseFullscreenIcon fontSize="small" />
              </IconButton>
            </Box>
            <HorizontalDivisor margin={1} />
            {children}
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
  return {
    Component,
    open,
    setOpen,
  };
};

export default useModal;
