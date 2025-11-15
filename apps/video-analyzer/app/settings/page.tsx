import React from 'react';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';
import AnimatedTitle from '@/components/animated-title';
import Background from '@/components/background';
import Divisor from '@repo/ui/divisor';
import TranslucentPaper from '@repo/ui/translucent-paper';
import Settings from '@/components/settings';

const Page = () => {
  return (
    <>
      <Background />
      <Container maxWidth="sm">
        <Divisor height={20} />
        <AnimatedTitle text="Video Analyzer Tool - Settings" />
        <Divisor />
        <TranslucentPaper>
          <Box
            display="flex"
            flexDirection="column"
            alignItems={'center'}
            padding={1}
          >
            <Settings />
          </Box>
        </TranslucentPaper>
      </Container>
    </>
  );
};

export default Page;
