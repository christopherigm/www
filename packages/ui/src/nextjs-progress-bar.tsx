'use client';

import { AppProgressBar } from 'next-nprogress-bar';

const NextJSProgressBarProvider = () => {
  return (
    <AppProgressBar
      height="4px"
      color="#fffd00"
      options={{ showSpinner: true }}
      shallowRouting
    />
  );
};

export default NextJSProgressBarProvider;
