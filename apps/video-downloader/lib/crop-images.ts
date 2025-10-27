import { mediaPath } from '@/config';
import CropImagesFn from '@repo/helpers/crop-images';

const CropImages = (
  songId: string,
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'wide' = 'portrait'
): Promise<void> => {
  const inputFolder = `${mediaPath}/ai-music/${songId}-images/`;
  const outputFolder = `${mediaPath}/ai-music/${songId}-ready-images/`;
  return CropImagesFn(inputFolder, outputFolder, aspectRatio);
  // return new Promise((res, rej) => {
  //   const inputFolder = `${mediaPath}/ai-music/${songId}-images/`;
  //   const outputFolder = `${mediaPath}/ai-music/${songId}-ready-images/`;
  //   // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  //   if (!fs.existsSync(outputFolder)) {
  //     fs.mkdirSync(outputFolder);
  //   }

  //   const width =
  //     aspectRatio === 'wide'
  //       ? 1280
  //       : aspectRatio === 'square'
  //         ? 1280
  //         : aspectRatio === 'portrait'
  //           ? 960
  //           : 1280;
  //   const height =
  //     aspectRatio === 'wide'
  //       ? 720
  //       : aspectRatio === 'square'
  //         ? 1280
  //         : aspectRatio === 'portrait'
  //           ? 1280
  //           : 960;

  //   const images: Array<string> = [];
  //   const filenames = fs.readdirSync(inputFolder);

  //   if (!filenames || !filenames.length) {
  //     return res();
  //   }

  //   filenames.forEach((file) => images.push(file));

  //   const promises: Array<Promise<void>> = [];
  //   images.map((file) => {
  //     promises.push(
  //       new Promise((res, rej) => {
  //         // https://www.npmjs.com/package/sharp
  //         sharp(`${inputFolder}/${file}`)
  //           .resize(width, height)
  //           .toFile(`${outputFolder}/${file}`, (err) => {
  //             if (err) {
  //               console.log('err:', err);
  //               return rej(err);
  //             }
  //             res();
  //           });
  //       })
  //     );
  //   });
  //   Promise.all(promises)
  //     .then(() => res())
  //     .catch(() => rej('error'));
  // });
};

export default CropImages;
