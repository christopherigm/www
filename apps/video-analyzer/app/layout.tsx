import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import AppClientProvider from '@/state/app-client-provider';
import type { Metadata, Viewport } from 'next';
import theme from '@repo/ui/theme';
import GetEnvVariables from '@repo/helpers/get-env-variables';
import DefaultLayout, {
  type DefaultLayoutProps,
} from '@repo/ui/default-layout';
import type Languages from '@repo/interfaces/languages';
import type MetaTagsProps from '@repo/interfaces/meta-tags-props';
import Menu from '@/app/menu';
import PersisteMenu from '@/app/persist-menu';

import { Geist } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
});

const env = GetEnvVariables();

export const metadata: Metadata = {
  title: env.ogTitle,
  description: env.ogDescription,
  manifest: '/static/manifest.json',
  icons: '/static/favicon.ico',
  openGraph: {
    siteName: env.ogSite,
    title: env.ogImg,
    images: env.ogImg,
    locale: env.language,
    type: 'website',
    description: env.ogDescription,
  },
};
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: env.themeColor,
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metatags = <></>;
  const language = env.language as Languages;

  const metaTagsProps: MetaTagsProps = {
    children: metatags,
    ...env,
  };

  const layoutProps: DefaultLayoutProps = {
    metaTagsProps,
    menu: (
      <Menu
        language={language}
        primaryColor={env.primaryColor ?? ''}
        darkNavBar={env.darkNavBar}
      />
    ),
    drawerMenu: (
      <Menu language={language} primaryColor={env.primaryColor ?? ''} />
    ),
    persistentMenu: (
      <PersisteMenu language={language} primaryColor={env.primaryColor ?? ''} />
    ),
    maxWidth: false,
  };

  return (
    <html className={geist.className}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <DefaultLayout {...layoutProps}>
            <AppClientProvider>{children}</AppClientProvider>
          </DefaultLayout>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </html>
  );
}
