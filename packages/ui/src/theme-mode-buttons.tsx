'use client';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useColorScheme } from '@mui/material/styles';
import Languages from '@repo/interfaces/languages';
import IconButton from '@mui/material/IconButton';
import { useEffect } from 'react';

type Props = {
  mini?: boolean;
  fullWidth?: boolean;
  language?: Languages;
};

const ThemeModeButtons = ({
  mini = false,
  fullWidth = true,
  language = 'en',
}: Props) => {
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    if (mode === 'system') {
      setMode('light');
    }
  }, [mode]);

  return (
    <>
      {mini ? (
        <>
          <IconButton aria-label="light" onClick={() => setMode('light')}>
            <LightModeIcon htmlColor={mode === 'light' ? 'primary' : 'gray'} />
          </IconButton>
          {/* <IconButton aria-label="system" onClick={() => setMode('system')}>
            <SettingsBrightnessIcon
              htmlColor={mode === 'system' ? 'primary' : 'gray'}
            />
          </IconButton> */}
          <IconButton aria-label="dark" onClick={() => setMode('dark')}>
            <DarkModeIcon htmlColor={mode === 'dark' ? 'primary' : 'gray'} />
          </IconButton>
        </>
      ) : (
        <ButtonGroup
          variant="outlined"
          aria-label="mode"
          fullWidth={fullWidth}
          sx={{
            bgcolor: 'white',
          }}
        >
          <Button
            size="medium"
            variant={mode === 'light' ? 'contained' : 'outlined'}
            startIcon={<LightModeIcon />}
            onClick={() => setMode('light')}
            style={{
              textTransform: 'initial',
            }}
          >
            {language === 'en' ? 'Light' : 'Claro'}
          </Button>
          {/* <Button
            size="medium"
            variant={mode === 'system' ? 'contained' : 'outlined'}
            startIcon={<SettingsBrightnessIcon />}
            onClick={() => setMode('system')}
            style={{
              textTransform: 'initial',
            }}
          >
            {language === 'en' ? 'System' : 'Sistema'}
          </Button> */}
          <Button
            size="medium"
            variant={mode === 'dark' ? 'contained' : 'outlined'}
            startIcon={<DarkModeIcon />}
            onClick={() => setMode('dark')}
            style={{
              textTransform: 'initial',
            }}
          >
            {language === 'en' ? 'Dark' : 'Obscuro'}
          </Button>
        </ButtonGroup>
      )}
    </>
  );
};

export default ThemeModeButtons;
