'use client';

import { useSystemContext } from '@/state/system-reducer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@repo/ui/generic-switch';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import Languages from '@repo/interfaces/languages';

const Settings = () => {
  const { state, dispatch } = useSystemContext();
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage as Languages;

  if (state.animatedBackground === undefined) {
    return null;
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Typography variant="body1">
        {language === 'en' ? 'Animated background' : 'Fondo animado'}
      </Typography>
      <Switch
        language={language}
        value={state.animatedBackground}
        onChange={() =>
          dispatch({
            type: 'set-animated-background',
            animatedBackground: !state.animatedBackground,
          })
        }
        defaultChecked={state.animatedBackground}
      />
    </Box>
  );
};

export default Settings;
