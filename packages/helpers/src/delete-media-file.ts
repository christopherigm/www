import fs from 'fs';

const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

const DeleteMediaFile = (path: string) => {
  if (!path) {
    return;
  }
  const rootFolder = nodeEnv == 'production' ? '/app' : 'public';
  try {
    fs.rmSync(`${rootFolder}/${path}`);
  } catch {
    // console.log('>>> DeleteMediaFile error:', e);
    console.log('>>> DeleteMediaFile File to delete:', `${rootFolder}/${path}`);
  }
};

export default DeleteMediaFile;
