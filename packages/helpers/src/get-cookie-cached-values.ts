import type { CachedValues } from '@repo/interfaces/system-interface';

const getBooleanValue = (value: string): boolean => {
  if (value === 'true') return true;
  return false;
};

const GetCookieCachedValues = (cookies: any): CachedValues => {
  return {
    language: cookies.language || null,
    devMode: getBooleanValue(cookies.devMode),
  };
};

export default GetCookieCachedValues;
