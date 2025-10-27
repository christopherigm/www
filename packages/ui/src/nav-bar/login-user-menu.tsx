'use client';

import { useEffect } from 'react';
import NavItem from '../nav-item';
import type MetaTagsProps from '@repo/interfaces/meta-tags-props';
import Box from '@mui/material/Box';
import { user as defaultUser } from '@repo/classes/base-user';
import { Signal } from '@preact-signals/safe-react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AddIcon from '@mui/icons-material/Add';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

type Props = {
  user?: Signal<any>;
  disableLoginButtons?: boolean;
} & MetaTagsProps;

const LoginUserMenu = ({
  language = 'en',
  primaryColor = '',
  darkNavBar = false,
  user = defaultUser,
  disableLoginButtons = false,
}: Props) => {
  useEffect(() => {
    user.value.setDataFromLocalStorage();
  }, []);

  return (
    <>
      {user.value.id ? (
        <Box color={darkNavBar ? 'white' : 'inherit'}>
          <NavItem
            icon={<AccountCircleIcon />}
            primaryColor={primaryColor}
            darkNavBar={darkNavBar}
            subMenus={[
              {
                children: language === 'en' ? 'Go to account' : 'Ir a cuenta',
                href: '/account',
                primaryColor,
                darkNavBar,
                icon: (
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                ),
              },
              {
                children: language === 'en' ? 'Logout' : 'Cerrar sesion',
                primaryColor,
                darkNavBar,
                icon: (
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                ),
                callback: () => user.value.logout(),
              },
            ]}
          >
            {user.value.short_name}
          </NavItem>
        </Box>
      ) : !disableLoginButtons ? (
        <Box color={darkNavBar ? 'white' : 'inherit'}>
          <NavItem
            icon={<AccountCircleIcon />}
            primaryColor={primaryColor}
            darkNavBar={darkNavBar}
            subMenus={[
              {
                children: language === 'en' ? 'Login' : 'Acceder',
                primaryColor,
                darkNavBar,
                href: '/sign-in',
                icon: (
                  <ListItemIcon>
                    <VpnKeyIcon fontSize="small" />
                  </ListItemIcon>
                ),
              },
              {
                children: language === 'en' ? 'Create account' : 'Crear cuenta',
                primaryColor,
                darkNavBar,
                href: '/sign-up',
                icon: (
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                ),
              },
            ]}
          >
            {language === 'en' ? 'Login' : 'Acceder'}
          </NavItem>
        </Box>
      ) : null}
    </>
  );
};

export default LoginUserMenu;
