'use client';

import React from 'react';
import type Languages from '@repo/interfaces/languages';
import NavItem from '@repo/ui/nav-item';
import HomeIcon from '@mui/icons-material/Home';

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
    </>
  );
};

export default Menu;
