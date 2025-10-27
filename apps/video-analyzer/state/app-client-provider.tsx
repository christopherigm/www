'use client';

import React, { ReactNode } from 'react';
import { VideoProvider } from '@/state/video-reducer';

import { SystemProvider } from '@/state/system-reducer';

type Props = {
  children?: ReactNode | Array<ReactNode>;
};

const AppClientProvider = ({ children }: Props) => {
  return (
    <SystemProvider>
      <VideoProvider>{children}</VideoProvider>
    </SystemProvider>
  );
};

export default AppClientProvider;
