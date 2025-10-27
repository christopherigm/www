'use client';

import { useEffect } from 'react';
import GetEnvVariables from '@repo/helpers/get-env-variables';
import { useColorScheme } from '@mui/material';

const ThemeOverride = () => {
  const { mode } = useColorScheme();

  useEffect(() => {
    const env = GetEnvVariables();
    // style={{
    //   ...(metaTagsProps &&
    //     (metaTagsProps.bodyBGColor || metaTagsProps.themeColor) && {
    //       backgroundColor:
    //         metaTagsProps.bodyBGColor ?? metaTagsProps.themeColor,
    //     }),
    // }}
    document.body.style.backgroundColor =
      mode === 'dark' ? '#111' : (env.bodyBGColor ?? '#777');
  }, [mode]);
  return <></>;
};

export default ThemeOverride;
