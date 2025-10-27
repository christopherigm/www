/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';
import AnimatedTitle from '@/components/animated-title';
import Background from '@/components/background';
import Divisor from '@repo/ui/divisor';
import TranslucentPaper from '@repo/ui/translucent-paper';
import Me from '@repo/ui/me';

const Page = () => {
  return (
    <>
      <Background />
      <Container maxWidth="sm">
        <Divisor height={20} />
        <AnimatedTitle text="Video Analyzer Tool - About" />
        <Divisor />
        <TranslucentPaper>
          <Box
            display="flex"
            flexDirection="column"
            alignItems={'center'}
            padding={1}
          >
            <Divisor />
            <Me src="/static/me.jpg" src2="/static/me2.jpg" label="Chris" />
            <Divisor />
            <Box
              paddingX={{
                sx: 0,
                sm: 2,
              }}
            >
              <Typography variant="body1" textAlign="center">
                👋 Hi! I&apos;m <strong>Christopher Guzman!</strong> I love
                building web projects and systems 💻. When I&apos;m not doing
                that, you&apos;ll find me hanging out with my family outdoors
                👨‍👩‍👧‍👦, snapping photos 📸, or hitting the hiking trails ⛰️.
              </Typography>
              <Divisor />
              <Typography variant="body1" textAlign="center">
                This site started with a personal mission: to help my mom easily
                access videos in languages she doesn&apos;t speak. It&apos;s
                been created with lots of love ❤️ and effort 💪, built using
                React, NextJS, Django, Postgres, and a dash of Local LLMs!
                Thanks for checking it out!
              </Typography>
              <Divisor />
              <Typography variant="body1" textAlign="center">
                🙏 Sorry in advance if you encounter any hiccups - I&apos;m
                always learning and improving!
              </Typography>
            </Box>
            <Divisor />
          </Box>
        </TranslucentPaper>
        <Divisor height={20} />
      </Container>
    </>
  );
};

export default Page;
