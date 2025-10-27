import type { EnvironmentVariables } from '@repo/interfaces/system-interface';
import type Languages from '@repo/interfaces/languages';
import GetBooleanFromString from './get-boolean-from-string';

const GetEnvVariables = (): EnvironmentVariables => {
  const hostName =
    process.env.HOSTNAME?.trim() ??
    process.env.NEXT_PUBLIC_HOSTNAME?.trim() ??
    'localhost';

  const URLBase =
    process.env.URL_BASE?.trim() ??
    process.env.NEXT_PUBLIC_URL_BASE?.trim() ??
    'http://127.0.0.1:3000';

  const domainURL =
    process.env.DOMAIN_URL?.trim() ??
    process.env.NEXT_PUBLIC_DOMAIN_URL?.trim() ??
    'http://127.0.0.1:3000';

  const K8sURLBase =
    process.env.K8S_URL_BASE?.trim() ??
    process.env.NEXT_PUBLIC_K8S_URL_BASE?.trim() ??
    'http://127.0.0.1:3000';

  const redisURL =
    process.env.REDIS_URL?.trim() ??
    process.env.NEXT_PUBLIC_REDIS_URL?.trim() ??
    'redis://localhost:6379';

  const defaultLanguage: Languages =
    (process.env.DEFAULT_LANGUAGE?.trim() as Languages) ??
    (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE?.trim() as Languages) ??
    'en';

  const logo =
    process.env.LOGO?.trim() ??
    process.env.NEXT_PUBLIC_LOGO?.trim() ??
    '/images/logo.png';

  const logoWidth = process.env.LOGO_WIDTH?.trim()
    ? Number(process.env.LOGO_WIDTH?.trim())
    : process.env.NEXT_PUBLIC_LOGO_WIDTH?.trim()
      ? Number(process.env.NEXT_PUBLIC_LOGO_WIDTH?.trim())
      : 100;

  const navBarBGColor =
    process.env.NAVBAR_BG_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_NAVBAR_BG_COLOR?.trim() ??
    '';

  const darkNavBar = GetBooleanFromString(
    process.env.DARK_NAVBAR ?? process.env.NEXT_PUBLIC_DARK_NAVBAR ?? ''
  );

  const footerBGColor =
    process.env.FOOTER_BG_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_FOOTER_BG_COLOR?.trim() ??
    '';

  const darkFooter = GetBooleanFromString(
    process.env.DARK_FOOTER ?? process.env.NEXT_PUBLIC_DARK_FOOTER ?? ''
  );

  const accentColor =
    process.env.ACCENT_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_ACCENT_COLOR?.trim() ??
    '';

  const loginEnabled = GetBooleanFromString(
    process.env.LOGIN_ENABLED ?? process.env.NEXT_PUBLIC_LOGIN_ENABLED ?? ''
  );

  const cartEnabled = GetBooleanFromString(
    process.env.CART_ENABLED ?? process.env.NEXT_PUBLIC_CART_ENABLED ?? ''
  );

  const favoritesEnabled = GetBooleanFromString(
    process.env.FAVORITES_ENABLED ??
      process.env.NEXT_PUBLIC_FAVORITES_ENABLED ??
      ''
  );

  const ordersEnabled = GetBooleanFromString(
    process.env.ORDERS_ENABLED ?? process.env.NEXT_PUBLIC_ORDERS_ENABLED ?? ''
  );

  const searchEnabled = GetBooleanFromString(
    process.env.SEARCH_ENABLED ?? process.env.NEXT_PUBLIC_SEARCH_ENABLED ?? ''
  );

  const version =
    process.env.VERSION?.trim() ??
    process.env.NEXT_PUBLIC_VERSION?.trim() ??
    '0.0.1';

  const favicon =
    process.env.FAVICON?.trim() ??
    process.env.NEXT_PUBLIC_FAVICON?.trim() ??
    '/static/favicon.ico';

  const ogTitle =
    process.env.OG_TITLE?.trim() ??
    process.env.NEXT_PUBLIC_OG_TITLE?.trim() ??
    'My Web App';

  const ogSite =
    process.env.OG_SITE?.trim() ??
    process.env.NEXT_PUBLIC_OG_SITE?.trim() ??
    'My web site';

  const ogImg =
    process.env.OG_IMG?.trim() ??
    process.env.NEXT_PUBLIC_OG_IMG?.trim() ??
    '/static/logo.png';

  const ogURL =
    process.env.OG_URL?.trim() ?? process.env.NEXT_PUBLIC_OG_URL?.trim() ?? '/';

  const ogDescription =
    process.env.OG_DESCRIPTION?.trim() ??
    process.env.NEXT_PUBLIC_OG_DESCRIPTION?.trim() ??
    'My Web App';

  const themeColor =
    process.env.THEME_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_THEME_COLOR?.trim() ??
    '#ffffff';

  const bodyBGColor =
    process.env.BODY_BG_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_BODY_BG_COLOR?.trim() ??
    '#ffffff';

  const github =
    process.env.GITHUB?.trim() ?? process.env.NEXT_PUBLIC_GITHUB?.trim() ?? '';

  const primaryColor =
    process.env.PRIMARY_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_PRIMARY_COLOR?.trim() ??
    '#000';

  const secondaryColor =
    process.env.SECONDARY_COLOR?.trim() ??
    process.env.NEXT_PUBLIC_SECONDARY_COLOR?.trim() ??
    '#777';

  return {
    hostName,
    URLBase,
    K8sURLBase,
    domainURL,
    redisURL,
    defaultLanguage,
    logo,
    logoWidth,
    navBarBGColor,
    darkNavBar,
    footerBGColor,
    darkFooter,
    loginEnabled,
    cartEnabled,
    favoritesEnabled,
    ordersEnabled,
    searchEnabled,
    version,
    favicon,
    ogTitle,
    ogSite,
    ogImg,
    ogURL,
    ogDescription,
    language: defaultLanguage,
    themeColor,
    bodyBGColor,
    github,
    primaryColor,
    secondaryColor,
    accentColor,
  };
};

export default GetEnvVariables;
