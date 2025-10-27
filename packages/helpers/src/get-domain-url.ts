import GetEnvVariables from '@repo/helpers/get-env-variables';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

const GetDomainURLFromEnv = (): string => {
  const env = GetEnvVariables();
  return nodeEnv === 'production'
    ? (env.domainURL ?? '')
    : 'http://127.0.0.1:3000';
};

export default GetDomainURLFromEnv;
