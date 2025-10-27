'use client';

import React from 'react';
import type Languages from '@repo/interfaces/languages';
import NavItem from '@repo/ui/nav-item';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

type Props = {
  language: Languages;
  primaryColor: string;
  darkNavBar?: boolean;
};

const Menu = ({ language, primaryColor, darkNavBar = false }: Props) => {
  return (
    <>
      <NavItem
        href="/"
        primaryColor={primaryColor}
        darkNavBar={darkNavBar}
        icon={<HomeIcon />}
      >
        {language === 'en' ? 'Home' : 'Inicio'}
      </NavItem>
      <NavItem
        href="/clock"
        primaryColor={primaryColor}
        darkNavBar={darkNavBar}
        icon={<AccessTimeIcon />}
      >
        {language === 'en' ? 'Clock' : 'Reloj'}
      </NavItem>
      <NavItem
        href="/multiplications"
        primaryColor={primaryColor}
        darkNavBar={darkNavBar}
        icon={<WorkspacesIcon />}
      >
        {language === 'en' ? 'Multiplications' : 'Multiplicaciones'}
      </NavItem>
    </>
  );
};

export default Menu;
