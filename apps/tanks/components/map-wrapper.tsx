'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

const Map = () => {
  const Map = useMemo(
    () => dynamic(() => import('@/components/map'), { ssr: false }),
    []
  );

  return <Map />;
};

export default Map;
