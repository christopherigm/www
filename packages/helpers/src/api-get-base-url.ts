import GetEnvVariables from '@repo/helpers/get-env-variables';

const APIGetBaseURLFromEnv = (): string => {
  const env = GetEnvVariables();
  return env.URLBase ?? '';
};

export default APIGetBaseURLFromEnv;
