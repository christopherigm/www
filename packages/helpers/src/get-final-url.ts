import { exec } from 'child_process';

const onData = () => {
  // console.log('>>> [onData][getFinalURL]:', data);
};

const getFinalURL = (url: string): Promise<string> => {
  return new Promise((res) => {
    let command = 'curl -Ls -o /dev/null -w %{url_effective} ';
    command += url;
    exec(command, (err, finalURL: string) => {
      if (err) {
        console.log('Error, getFinalURL:', err);
        finalURL = url;
      }
      res(finalURL);
    }).stdout?.on('data', onData);
  });
};

export default getFinalURL;
