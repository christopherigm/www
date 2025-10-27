const removeImagesForAPICall = (object: any) => {
  for (const i in object) {
    if (
      Object.prototype.hasOwnProperty.call(object, i) &&
      (i === 'img_picture' || i === 'img_logo' || i === 'img_cover') &&
      String(object[i]).search('base64') < 0
    ) {
      delete object[i];
    }
  }
};

export default removeImagesForAPICall;
