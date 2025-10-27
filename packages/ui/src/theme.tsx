'use client';

import { createTheme } from '@mui/material/styles';
import GetEnvVariables from '@repo/helpers/get-env-variables';

const env = GetEnvVariables();

const theme = createTheme({
  defaultColorScheme: 'light',
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: env.primaryColor ?? '#000',
        },
        secondary: {
          main: env.secondaryColor ?? '#000',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: env.primaryColor ?? '#000',
        },
        secondary: {
          main: env.secondaryColor ?? '#000',
        },
      },
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});

export default theme;

// https://mui.com/material-ui/customization/breakpoints/#default-breakpoints
