import { ReactNode } from 'react';
import { Breakpoint } from '@mui/material/styles';
import NavBar from './nav-bar';
import Footer from './footer';
import type MetaTagsProps from '@repo/interfaces/meta-tags-props';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ThemeOverride from '@repo/ui/theme-override';

import NextJSProgressBarProvider from '@repo/ui/nextjs-progress-bar';

export type DefaultLayoutProps = {
  children?: any;
  isLoading?: boolean;
  persistentMenu?: any;
  menu?: ReactNode;
  maxWidth?: Breakpoint | false;
  maxWidthNavBar?: Breakpoint | false;
  drawerMenu?: ReactNode;
  onSearch?: (value: string) => void;
  metaTagsProps?: MetaTagsProps;
};

const DefaultLayout = ({
  children,
  persistentMenu,
  menu,
  maxWidth = 'lg',
  maxWidthNavBar = 'lg',
  drawerMenu,
  onSearch,
  metaTagsProps,
}: DefaultLayoutProps) => {
  const navProps = {
    ...metaTagsProps,
    drawerMenu: drawerMenu ?? menu,
    persistentMenu,
  };

  const TopPadding = (
    <Box
      height={{
        xs: 56,
        sm: 64,
      }}
      className="hide-on-print"
    />
  );

  const BottomPadding = (
    <Box
      height={{
        xs: 0,
        sm: 66,
      }}
      className="hide-on-print"
    />
  );

  return (
    <>
      <body
      // style={{
      //   ...(metaTagsProps &&
      //     (metaTagsProps.bodyBGColor || metaTagsProps.themeColor) && {
      //       backgroundColor:
      //         metaTagsProps.bodyBGColor ?? metaTagsProps.themeColor,
      //     }),
      // }}
      // style={{
      //   display: 'flex',
      //   flexDirection: 'column',
      //   justifyContent: 'space-between',
      //   height: '100vh',
      // }}
      >
        <header>
          <NavBar {...navProps}>{menu}</NavBar>
        </header>
        <Box>
          <NextJSProgressBarProvider />
          {maxWidth ? (
            <Container maxWidth={maxWidth}>
              {TopPadding}
              {children}
              {BottomPadding}
            </Container>
          ) : (
            <>
              {TopPadding}
              {children}
              {BottomPadding}
            </>
          )}
        </Box>
        <Box
          position="fixed"
          bottom={0}
          left={0}
          width="100%"
          display={{
            xs: 'none',
            sm: 'block',
          }}
          zIndex={999}
          boxShadow="3px 4px 4px rgba(0,0,0,0.5)"
        >
          <Footer {...metaTagsProps} />
        </Box>
        <ThemeOverride />
      </body>
    </>
  );
};

export default DefaultLayout;
