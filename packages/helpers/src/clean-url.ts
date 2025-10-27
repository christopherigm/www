export const cleanURL = (data: string): string => {
  const isHTTPS = data.search(/https/g) > -1;
  const matches = isHTTPS
    ? data.match(/https?:\/\/[^\s]+/)
    : data.match(/http?:\/\/[^\s]+/);
  if (matches?.length) {
    let match = matches[0] ?? '';
    const url = match.split('，')[0];
    return url ?? '';
  }
  return data;
};

export const isURLClean = (data: string): boolean => {
  let isClean = true;
  if (data.search(/ /g) > -1) {
    isClean = false;
  } else if (!data.startsWith('http')) {
    isClean = false;
  }
  return isClean;
};
