import React from 'react';
import EditorForm from '@/components/editor';
import GetEnvVariables from '@repo/helpers/get-env-variables';

const Page = () => {
  const env = GetEnvVariables();

  return <EditorForm {...env} />;
};

export default Page;
