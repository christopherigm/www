/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const { exit, env } = require('process');
const fs = require('fs');

let isTest = false;
if (process.argv.length > 2) {
  isTest = process.argv[2] === 'test';
}

// Editable variables
const name = 'video-analyzer-api';
const namespace = `video-analyzer${isTest ? '-test' : ''}`;
const envFile = `${isTest ? 'test' : ''}.env`;
// Editable variables

require('dotenv').config({ path: envFile });

const upgradeVersion = (version) => {
  const a = version.split('.');
  if (Number(a[2]) === 9) {
    if (Number(a[1]) === 9) {
      a[0] = Number(a[0]) + 1;
      a[1] = 0;
    } else {
      a[1] = Number(a[1]) + 1;
    }
    a[2] = 0;
  } else {
    a[2] = Number(a[2]) + 1;
  }
  const newVersion = `${a[0]}.${a[1]}.${a[2]}`;
  return newVersion;
};

const allFileContents = fs.readFileSync(envFile, 'utf-8');
let newLines = '';
allFileContents.split(/\r?\n/).forEach((line) => {
  if (line !== '' && line.substring(0, 7) === 'VERSION') {
    const value = line.split('=')[1].replace(/\'/g, '');
    upgradeVersion(value);
    newLines += `VERSION='${upgradeVersion(value)}'\r\n`;
  } else if (line !== '') {
    newLines += `${line}\r\n`;
  }
});
fs.writeFileSync(envFile, newLines);

let branch = '';
const startTime = new Date(Date.now());

const onData = (data) => {
  console.log(data);
};

const getSecretKey = (count = 0, value = '') => {
  if (count > 5) return value;
  value += Math.trunc(Math.random(1) * 99999);
  count++;
  return getSecretKey(count, value);
};

const getBranchName = () => {
  return new Promise((res, rej) => {
    exec('git branch --show-current', (err, stdout) => {
      if (err) return rej(err);
      const b = stdout.toString().replace(/(\r\n|\n|\r)/gm, '');
      branch = b;
      res(branch);
    }).stdout.on('data', onData);
  });
};

const deleteNginxDeployment = () => {
  return new Promise((res, rej) => {
    exec(`helm delete nginx-api -n ${namespace}`, (_err, stdout) => {
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const deleteDeployment = () => {
  return new Promise((res) => {
    exec(`helm delete ${name} -n ${namespace}`, (err, stdout) => {
      if (err) return res(err);
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const deployNginxMicroservice = () => {
  return new Promise((res, rej) => {
    let command = `helm install nginx-api deployment/nginx `;
    command += `--namespace=${namespace} `;
    command += `--set apiName=${name}`;
    exec(command, (err, stdout) => {
      if (err) return rej(err);
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const deployMicroservice = () => {
  return new Promise((res, rej) => {
    let command = `helm install ${name} deployment `;
    command += `--namespace=${namespace} `;
    if (env.HOST !== undefined) {
      command += `--set config.HOST="${env.HOST}" `;
    }
    if (env.API_URL !== undefined) {
      command += `--set config.API_URL="${env.API_URL}" `;
    }
    if (env.WEB_APP_URL !== undefined) {
      command += `--set config.WEB_APP_URL="${env.WEB_APP_URL}" `;
    }
    if (env.RUN_FIXTURES !== undefined) {
      command += `--set config.RUN_FIXTURES=${env.RUN_FIXTURES} `;
    }
    if (env.DB_HOST !== undefined) {
      command += `--set config.DB_HOST=${env.DB_HOST} `;
    }
    if (env.REDIS_URL !== undefined) {
      command += `--set config.REDIS_URL="${env.REDIS_URL}" `;
    }
    command += `--set config.SECRET_KEY=${
      process.env.SECRET_KEY ?? getSecretKey()
    } `;
    command += `--set config.ENVIRONMENT=production `;
    command += `--set config.BRANCH=${branch} `;
    command += `--set config.DB_NAME=${env.DB_NAME} `;
    command += `--set config.DB_USER=${env.DB_USER} `;
    command += `--set config.DB_PASSWORD=${env.DB_PASSWORD} `;
    command += `--set config.EMAIL_HOST_USER=${env.EMAIL_HOST_USER} `;
    command += `--set config.EMAIL_HOST_PASSWORD=${env.EMAIL_HOST_PASSWORD} `;
    command += `--set image.tag=${branch}`;
    console.log('command:', command);
    exec(command, (err, stdout) => {
      if (err) return rej(err);
      res(stdout);
    }).stdout.on('data', onData);
  });
};

getBranchName()
  .then(() => deleteDeployment())
  .then(() => deleteNginxDeployment())
  .then(() => deployMicroservice())
  .then(() => deployNginxMicroservice())
  .then(() => {
    const endTime = new Date(Date.now());
    const difference = (endTime - startTime) / 100 / 60 / 60;
    console.log('\nProcess Complete!!');
    console.log('\nBranch:', branch);
    console.log('Starting time:', startTime);
    console.log('Ending time:', endTime);
    console.log(
      'Processing time:',
      Math.round((difference + Number.EPSILON) * 100) / 100,
      'minutes.'
    );
    exit(0);
  })
  .catch((err) => {
    if (err && err.response && err.response.statusText) {
      console.log('\nError:', err.response.statusText);
    } else {
      console.log('\nError:', err);
    }
    exit(1);
  });
