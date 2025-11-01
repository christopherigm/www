'use client';

import { ReactNode, useState, MouseEvent, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { usePathname } from 'next/navigation';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { drawerOpen } from './drawer';
import HorizontalDivisor from './horizontal-divisor';

type ItemProps = {
  children: ReactNode;
  href?: string;
  callback?: () => void;
  icon?: ReactNode;
  selected?: boolean;
  primaryColor?: string;
  darkNavBar?: boolean;
};

type Props = {
  subMenus?: Array<ItemProps>;
} & ItemProps;

const NavItem = ({
  children,
  href,
  callback,
  icon,
  selected,
  primaryColor = '#000',
  darkNavBar = false,
  subMenus = [],
}: Props): ReactNode => {
  const theme = useTheme();
  const notXS = useMediaQuery(theme.breakpoints.not('xs'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [isHome, setIsHome] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    drawerOpen.value = false;
  };
  const pathname = usePathname();

  useEffect(() => {
    setIsSelected(pathname === href);
    setIsHome(pathname === href && pathname === '/');
  }, [pathname, href]);

  const SelectedStyle = {
    textTransform: 'initial',
    color:
      darkNavBar || isSelected || selected
        ? 'white'
        : primaryColor
          ? primaryColor
          : '',
    ...((isSelected || selected) &&
      primaryColor && {
        backgroundColor: primaryColor,
        fontWeight: 'bold',
      }),
  };

  const Icon = (
    <Box
      display={{
        xs: 'contents',
        sm: 'none',
        md: 'contents',
      }}
    >
      {icon}
    </Box>
  );

  const RegularButton = (
    <>
      {notXS ? (
        <>
          <Button
            fullWidth
            startIcon={icon ? Icon : null}
            href={href}
            onClick={() => (drawerOpen.value = false)}
            sx={SelectedStyle}
          >
            {children}
          </Button>
        </>
      ) : (
        <Box display="flex" flexDirection="column" width="100%">
          <Button
            fullWidth
            href={href}
            onClick={() => (drawerOpen.value = false)}
            sx={{
              ...SelectedStyle,
              display: 'flex',
              paddingX: 2,
            }}
          >
            {children}
            <Box flexGrow={1} />
            {icon}
          </Button>
          <HorizontalDivisor margin={1} />
        </Box>
      )}
    </>
  );

  const CallbackButton = (
    <Button
      fullWidth
      startIcon={Icon}
      onClick={() => {
        if (callback !== undefined) {
          callback();
        }
        drawerOpen.value = false;
      }}
      sx={SelectedStyle}
    >
      {children}
    </Button>
  );

  const MenuButton = (
    <Button
      fullWidth
      startIcon={Icon}
      sx={SelectedStyle}
      id="basic-button"
      aria-controls={open ? 'basic-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleClick}
    >
      {children}
    </Button>
  );

  if (isHome) {
    return;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width={{
        xs: '100%',
        sm: 'auto',
      }}
    >
      {href ? (
        RegularButton
      ) : callback ? (
        <>{CallbackButton}</>
      ) : subMenus.length ? (
        <>
          {MenuButton}
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            {subMenus.map((i: ItemProps, index: number) => {
              return (
                <Box key={index}>
                  {i.href ? (
                    <Link href={i.href}>
                      <MenuItem onClick={handleClose}>
                        {i.icon ? <ListItemIcon>{i.icon}</ListItemIcon> : null}
                        <ListItemText>{i.children}</ListItemText>
                      </MenuItem>
                    </Link>
                  ) : (
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        if (i.callback !== undefined) {
                          i.callback();
                        }
                        drawerOpen.value = false;
                      }}
                    >
                      {i.icon ? <ListItemIcon>{i.icon}</ListItemIcon> : null}
                      <ListItemText>{i.children}</ListItemText>
                    </MenuItem>
                  )}
                </Box>
              );
            })}
          </Menu>
        </>
      ) : null}
      <Box
        height={30}
        borderRight="1px solid #bbb"
        display={{
          xs: 'none',
          sm: 'initial',
        }}
      />
    </Box>
  );
};

export default NavItem;
