import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { Metadata } from 'next';
import Markdown from 'react-markdown';
import { Container } from '@mui/material';
import { readFileSync } from 'fs';

const data = readFileSync('public/terms-and-conditions.md', 'utf8');

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Terms and conditions',
  };
};

const Page = () => {
  return (
    <Container>
      <Typography marginTop={3} variant="h4">
        Video Analyzer Tool - Terms and Conditions
      </Typography>
      <Box padding={2}>
        <Markdown>{data}</Markdown>
      </Box>
    </Container>
  );
};

export default Page;
