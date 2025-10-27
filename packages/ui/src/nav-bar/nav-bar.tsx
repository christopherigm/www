import AppBar from '@mui/material/AppBar';
import type { Breakpoint } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
// import Search from './search';
import Drawer from '../drawer';
import Logo from '../logo';

import type MetaTagsProps from '@repo/interfaces/meta-tags-props';
import Box from '@mui/material/Box';
import LoginUserMenu from './login-user-menu';
import { useEffect } from 'react';

type Props = {
  children?: any;
  drawerMenu?: any;
  persistentMenu?: any;
  maxWidth?: Breakpoint | false;
} & MetaTagsProps;

const NavBar = ({
  children,
  ogTitle,
  drawerMenu,
  persistentMenu,
  searchEnabled,
  loginEnabled,
  maxWidth,
  version = '',
  github = '',
  primaryColor = '',
  secondaryColor = '',
  language = 'en',
  logo,
  logoWidth,
  navBarBGColor,
  darkNavBar = false,
  footerBGColor,
  darkFooter = false,
}: Props) => {
  // const { searchBar, isSearchBarOpen } = Search({ language, darkNavBar });
  // const

  return (
    <>
      <AppBar
        position="fixed"
        component="nav"
        className="hide-on-print"
        sx={{
          ...(navBarBGColor && { bgcolor: navBarBGColor }),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Container maxWidth={maxWidth}>
          <Toolbar disableGutters>
            <Box
              display="flex"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Logo src={logo} width={logoWidth} />
              <Drawer
                version={version}
                github={github}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                language={language}
                logo={logo}
                logoWidth={logoWidth}
                navBarBGColor={navBarBGColor}
                footerBGColor={footerBGColor}
                darkFooter={darkFooter}
                darkNavBar={darkNavBar}
                loginEnabled={loginEnabled}
              >
                {drawerMenu}
              </Drawer>
              <Box flexGrow={1}></Box>
              <Box
                display={{
                  xs: 'none',
                  // sm: isSearchBarOpen ? 'none' : 'flex',
                  sm: 'flex',
                  lg: 'flex',
                }}
                flexWrap="wrap"
                justifyContent="end"
                // color={darkNavBar ? 'white' : 'primary'}
              >
                {children}
                {loginEnabled ? (
                  <LoginUserMenu
                    language={language}
                    primaryColor={primaryColor}
                    darkNavBar={darkNavBar}
                  />
                ) : null}
              </Box>
              {persistentMenu !== undefined ? (
                <>
                  <Box width={10} />
                  {persistentMenu}
                </>
              ) : null}
              {/* {searchEnabled ? searchBar : null} */}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default NavBar;
