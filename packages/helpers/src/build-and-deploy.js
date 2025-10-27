/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');
const { exit } = require('process');
const fs = require('fs');

const name = process.env.NAME ?? '';
const namespace = process.env.NAME_SPACE ?? '';
const registry = process.env.REGISTRY ?? '';
const host = process.env.HOST ?? '';
const envFile = '.env';

if (!name || !namespace || !registry || !host) {
  console.log('Missing .env parameters');
  return;
}

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
  if (line !== '' && line.substring(0, 19) === 'NEXT_PUBLIC_VERSION') {
    const value = line.split('=')[1].replace(/\'/g, '');
    upgradeVersion(value);
    newLines += `NEXT_PUBLIC_VERSION='${upgradeVersion(value)}'\r\n`;
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

const buildPackage = () => {
  return new Promise((res, rej) => {
    console.log('\n========= Building App =========');
    exec('npm run build', (err, stdout) => {
      if (err) return rej(err);
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const buildDockerImage = () => {
  return new Promise((res, rej) => {
    console.log('\n========= Building Docker Image =========');
    const command = `docker build -t ${name} .`;
    console.log('\nCommand:', command);
    exec(command, (err, stdout) => {
      if (err) return rej(err);
      console.log('\nDocker Image built');
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const tagDockerImage = () => {
  return new Promise((res, rej) => {
    console.log('\n========= Tagging Docker Image =========');
    const command = `docker tag ${name} ${registry}/${name}:${branch}`;
    console.log('\nCommand:', command);
    exec(command, (err, stdout) => {
      if (err) return rej(err);
      console.log('\nDocker Image tagged!');
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const publishDockerImage = () => {
  return new Promise((res, rej) => {
    console.log('\n========= Publishing Docker Image =========');
    getBranchName()
      .then((branch) => {
        const command = `docker push ${registry}/${name}:${branch}`;
        console.log('\nCommand:', command);
        exec(command, (err, stdout) => {
          if (err) return rej(err);
          console.log('\nDocker Image published!');
          res(stdout);
        }).stdout.on('data', onData);
      })
      .catch((err) => {
        console.log('\nBuild Docker image error:', err);
      });
  });
};

const deleteDeployment = () => {
  return new Promise((res) => {
    console.log('\n========= Delete current Helm deployment =========');
    const command = `helm delete ${name} -n ${namespace}`;
    console.log('\nCommand:', command);
    exec(command, (_err, stdout) => {
      res(stdout);
    }).stdout.on('data', onData);
  });
};

const deployMicroservice = () => {
  return new Promise((res, rej) => {
    console.log('\n========= Install Helm deployment =========');
    let command = `helm install ${name} deployment `;
    command += `--namespace=${namespace} `;
    command += `--set name=${name} `;
    command += `--set image.registry=${registry} `;
    command += `--set image.repository=${name} `;
    command += `--set image.tag=${branch} `;
    command += `--set ingress.host=${host} `;
    console.log('\nCommand:', command);
    exec(command, (err, stdout) => {
      if (err) return rej(err);
      res(stdout);
    }).stdout.on('data', onData);
  });
};

getBranchName()
  .then(() => buildPackage())
  .then(() => buildDockerImage())
  .then(() => tagDockerImage())
  .then(() => publishDockerImage())
  .then(() => deleteDeployment())
  .then(() => deployMicroservice())
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
