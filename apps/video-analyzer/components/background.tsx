'use client';

import { useColorScheme } from '@mui/material/styles';
import { GalaxyBg } from '@repo/ui/galaxy';
import { SilkBg } from '@repo/ui/silk';

const Background = () => {
  const { mode } = useColorScheme();

  return (
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
  );
};

export default Background;
