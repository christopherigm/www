const isRedNote = (url: string): boolean => {
  return (
    url.search('https://xhslink.com') > -1 ||
    url.search('http://xhslink.com') > -1 ||
    url.search('https://xiaohongshu.com') > -1 ||
    url.search('https://www.xiaohongshu.com') > -1
  );
};

export default isRedNote;
