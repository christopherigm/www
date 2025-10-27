/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { signal } from '@preact-signals/safe-react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import PostAddIcon from '@mui/icons-material/PostAdd';
import Footer from './footer';
import Logo from './logo';
import ThemeModeButtons from './theme-mode-buttons';
import NavItem from './nav-item';
import type MetaTagsProps from '@repo/interfaces/meta-tags-props';
import LoginUser from './nav-bar/login-user-menu';
import { useEffect } from 'react';

export const drawerOpen = signal<boolean>(false);

type Props = {
  children?: any;
  drawerWidth?: number;
} & MetaTagsProps;

const MobileDrawer = ({
  children,
  drawerWidth = 320,
  version = '',
  github = '',
  primaryColor = '',
  language = 'en',
  logo = '',
  footerBGColor,
  darkFooter = false,
  darkNavBar = false,
  loginEnabled = false,
}: Props) => {
  useEffect(() => {
    drawerOpen.value = false;
  }, []);

  return (
    <>
      <IconButton
        aria-label="open drawer"
        onClick={() => (drawerOpen.value = !drawerOpen.value)}
        sx={{
          display: { sm: 'none' },
          ...(darkNavBar && { color: 'white' }),
        }}
        color="primary"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        disableScrollLock={true}
        open={drawerOpen.value}
        onClose={() => (drawerOpen.value = !drawerOpen.value)}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Logo src={logo} fullWidth />
        <Divider />
        <Box height={10} />
        <Box flexGrow={1}>{children}</Box>
        {loginEnabled ? <LoginUser language={language} /> : null}
        <NavItem
          href="/terms-and-conditions"
          primaryColor={primaryColor}
          darkNavBar={false}
          icon={<PostAddIcon />}
        >
          {language === 'en'
            ? 'Terms and Conditions'
            : 'Terminos y condiciones'}
        </NavItem>
        <Box height={20} />
        <Box paddingLeft={1} paddingRight={1}>
          <ThemeModeButtons language={language} />
        </Box>
        <Box height={20} />
        <Footer
          version={version}
          github={github}
          primaryColor={primaryColor}
          footerBGColor={footerBGColor}
          darkFooter={darkFooter}
        />
      </Drawer>
    </>
  );
};

export default MobileDrawer;
