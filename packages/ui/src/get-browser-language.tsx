'use client';

import { useState, useEffect } from 'react';
import type Languages from '@repo/interfaces/languages';

const GetBrowserLanguage = () => {
  const [browserLanguage, setLanguage] = useState<Languages>('en');

  useEffect(() => {
    if (window !== undefined && window && navigator && navigator.language) {
      const lang1 = navigator.language.toLowerCase().split('_');
      if (lang1 && lang1.length && lang1[0] === 'es') {
        setLanguage('es');
      }
      const lang2 = navigator.language.toLowerCase().split('-');
      if (lang2 && lang2.length && lang2[0] === 'es') {
        setLanguage('es');
      }
    }
  }, []);

  return { browserLanguage };
};

export default GetBrowserLanguage;
