const RandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const addRandomNumberToURL = (url: string): string => {
  let newURL = url;
  const newRandomID = RandomNumber(1, 9999);
  if (newURL.search(/\?vdRID/) > -1) {
    newURL = newURL.split(/\?vdRID/)[0] ?? newURL;
  }
  if (newURL.search(/\&vdRID/) > -1) {
    newURL = newURL.split(/\&vdRID/)[0] ?? newURL;
  }
  if (newURL.search(/\?/) > -1) {
    newURL += '&vdRID=';
  } else {
    newURL += '?vdRID=';
  }
  newURL += newRandomID;
  return newURL;
};

export default RandomNumber;
