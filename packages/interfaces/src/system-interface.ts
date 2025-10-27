import Languages from './languages';

export type EnvironmentVariables = {
  hostName?: string;
  URLBase?: string;
  K8sURLBase?: string;
  domainURL?: string;
  redisURL?: string;
  defaultLanguage?: string;
  logo?: string;
  logoWidth?: number;
  navBarBGColor?: string;
  darkNavBar?: boolean;
  footerBGColor?: string;
  darkFooter?: boolean;
  loginEnabled?: boolean;
  cartEnabled?: boolean;
  favoritesEnabled?: boolean;
  ordersEnabled?: boolean;
  searchEnabled?: boolean;
  version?: string;
  favicon?: string;
  ogTitle?: string;
  ogSite?: string;
  ogImg?: string;
  ogURL?: string;
  ogDescription?: string;
  language?: Languages;
  themeColor?: string;
  bodyBGColor?: string;
  github?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
};

export type CachedValues = {
  devMode?: boolean;
} & EnvironmentVariables;

export type System = {
  paths: Array<string>;
  isLoading?: boolean;
} & EnvironmentVariables;

export type setSystem = (s: any) => void;
