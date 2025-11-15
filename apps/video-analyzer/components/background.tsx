'use client';

import { useSystemContext } from '@/state/system-reducer';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';
import { GalaxyBg } from '@repo/ui/galaxy';
import { SilkBg } from '@repo/ui/silk';
import GetDomainURLFromEnv from '@repo/helpers/get-domain-url';

const domainURL = GetDomainURLFromEnv();

const Background = () => {
  const { state } = useSystemContext();
  const { mode } = useColorScheme();
  if (mode === undefined || state.animatedBackground === undefined) {
    return null;
  }
  const bg = mode === 'dark' ? 'black-bg.jpg' : 'gray-bg.jpg';

  return (
    <>
      {state.animatedBackground ? (
        <>
          {mode === 'dark' ? (
            <GalaxyBg
              mouseInteraction={false}
              mouseRepulsion={false}
              speed={0.02}
              rotationSpeed={0.02}
            />
          ) : (
            <SilkBg />
          )}
        </>
      ) : (
        <Box
          width="100%"
          height="100vh"
          position="fixed"
          zIndex={-1}
          sx={{
            backgroundImage: `url(${domainURL}/images/${bg})`,
          }}
        ></Box>
      )}
    </>
  );
};

export default Background;
