import fs from 'fs';

const SaveBase64Images = (
  destinationFolder: string,
  images: Array<string> = []
): Promise<void> => {
  return new Promise((res, rej) => {
    if (!fs.existsSync(destinationFolder)) {
      try {
        fs.mkdirSync(destinationFolder);
      } catch (e) {
        console.log('>>> Warning SaveBase64Images!:', e);
      }
    }
    if (!images || !images.length) {
      return res();
    }

    const imagesInFolder = fs.readdirSync(destinationFolder);
    const initialIndex = imagesInFolder.length;

    const promises: Array<Promise<void>> = [];
    images.map((image, index: number) => {
      promises.push(
        new Promise((res, rej) => {
          // https://www.codeblocq.com/2016/04/Convert-a-base64-string-to-a-file-in-Node/
          const base62Image = image.split(';base64,').pop() ?? '';
          fs.writeFile(
            `${destinationFolder}/${initialIndex + index}.jpg`,
            base62Image,
            { encoding: 'base64' },
            (error) => {
              if (error) {
                rej(error);
              }
              res();
            }
          );
        })
      );
    });
    Promise.all(promises)
      .then(() => res())
      .catch(() => rej('error'));
  });
};

export default SaveBase64Images;
