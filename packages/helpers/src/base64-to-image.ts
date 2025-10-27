const base64ToImage = (
  base64String: string,
  imageType = 'image/png'
): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((res) => {
    const image = new Image();
    image.onload = () => {
      return res(image);
    };
    image.src = base64String;
  });
};

export default base64ToImage;
