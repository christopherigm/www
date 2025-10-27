'use client';

import React from 'react';
import type Languages from '@repo/interfaces/languages';
import NavItem from '@repo/ui/nav-item';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';

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
        href="/about"
        primaryColor={primaryColor}
        darkNavBar={darkNavBar}
        icon={<InfoIcon />}
      >
        {language === 'en' ? 'About' : 'Acerca'}
      </NavItem>
      {/* <NavItem
        href="/"
        primaryColor={primaryColor}
        darkNavBar={darkNavBar}
        icon={<HomeIcon />}
      >
        {language === 'en' ? 'Home' : 'Inicio'}
      </NavItem> */}
      {/* <NavItem
        href="/create"
        primaryColor={primaryColor}
        darkNavBar={darkNavBar}
        icon={<HomeIcon />}
      >
        {language === 'en' ? 'Create' : 'Crear'}
      </NavItem> */}
    </>
  );
};

export default Menu;
