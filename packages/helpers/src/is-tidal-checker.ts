const isTidal = (url: string): boolean => {
  return (
    url.search('https://tidal.com') > -1 ||
    url.search('https://www.tidal.com') > -1
  );
};

export default isTidal;
