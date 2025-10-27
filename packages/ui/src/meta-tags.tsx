import Head from 'next/head';
import type MetaTagsProps from '@repo/interfaces/meta-tags-props';

const MetaTags = ({
  children,
  favicon = '/static/favicon.ico',
  ogTitle = '',
  ogSite = '',
  ogURL = '',
  ogDescription = '',
  ogImg = '/static/logo.png',
  themeColor = '#ffffff',
  language = 'en',
  version = '',
  github = '',
  primaryColor = '',
  secondaryColor = '',
}: MetaTagsProps) => {
  return (
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover"
      />
      <link rel="icon" href={favicon} />
      <meta name="description" content={ogTitle} />
      <title>{ogTitle}</title>
      <meta name="theme-color" content={themeColor} />
      <meta name="og:title" content={ogTitle} />
      <meta name="twitter:card" content={ogImg} />
      <meta name="description" content={ogDescription} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={ogSite || ogTitle} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImg} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:url" content={ogURL} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:ttl" content="604800" />
      <meta name="docsearch:language" content={language} />
      <link rel="manifest" href="/static/manifest.json" />
      {children}
    </Head>
  );
};

export default MetaTags;
