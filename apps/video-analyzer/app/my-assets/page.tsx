import React from 'react';
import { Container } from '@mui/material';
import AnimatedTitle from '@/components/animated-title';
import Background from '@/components/background';
import Divisor from '@repo/ui/divisor';
import AssetsForm from '@/components/assets-form';

const Page = () => {
  return (
    <>
      <Background />
      <Container maxWidth="lg">
        <Divisor height={20} />
        <AnimatedTitle text="Video Analyzer Tool - My assets" />
        <Divisor />
      </Container>
      <AssetsForm />
      <Divisor height={20} />
    </>
  );
};

export default Page;
