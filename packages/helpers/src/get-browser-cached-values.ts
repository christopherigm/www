import type Languages from '@repo/interfaces/languages';
import { GetCachedValue } from './cookie-handler';

const GetBrowserCachedValues = (): any => {
  return {
    language: (GetCachedValue('language') as Languages) || 'en',
    darkMode: Boolean(GetCachedValue('dark-mode') || false),
    devMode: Boolean(GetCachedValue('dev-mode') || false),
  };
};

export default GetBrowserCachedValues;
