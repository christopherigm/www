import React from 'react';
import DownloadForm from '@/components/download-form';
import GridOfItems from '@/components/gird-of-items';
import GetEnvVariables from '@repo/helpers/get-env-variables';

const Page = () => {
  const env = GetEnvVariables();

  return (
    <>
      <DownloadForm {...env} />
      <GridOfItems />
    </>
  );
};

export default Page;
