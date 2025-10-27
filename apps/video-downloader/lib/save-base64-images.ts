import { mediaPath } from '@/config';
import SaveImages from '@repo/helpers/save-base-64-images';

const SaveBase64Images = (
  songId: string,
  images: Array<string> = []
): Promise<void> => {
  const outputFolder = `${mediaPath}/ai-music/${songId}-images/`;
  return SaveImages(outputFolder, images);
  // return new Promise((res, rej) => {

  //   // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  //   if (!fs.existsSync(outputFolder)) {
  //     fs.mkdirSync(outputFolder);
  //   }
  //   if (!images || !images.length) {
  //     return res();
  //   }

  //   const imagesInFolder = fs.readdirSync(outputFolder);
  //   const initialIndex = imagesInFolder.length;

  //   const promises: Array<Promise<void>> = [];
  //   images.map((image, index: number) => {
  //     promises.push(
  //       new Promise((res, rej) => {
  //         // https://www.codeblocq.com/2016/04/Convert-a-base64-string-to-a-file-in-Node/
  //         const base64Image = image.split(';base64,').pop() ?? '';
  //         fs.writeFile(
  //           `${outputFolder}/${initialIndex + index}.jpg`,
  //           base64Image,
  //           { encoding: 'base64' },
  //           (error) => {
  //             if (error) {
  //               rej(error);
  //             }
  //             res();
  //           }
  //         );
  //       })
  //     );
  //   });
  //   Promise.all(promises)
  //     .then(() => res())
  //     .catch(() => rej('error'));
  // });
};

export default SaveBase64Images;
